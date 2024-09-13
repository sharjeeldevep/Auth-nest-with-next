currentBranch=$(git branch --show-current);

echo "Current Branch: $currentBranch";

if [ $currentBranch != "development" ]
then
    echo "Invalid branch checked out for this development"
    exit 2;
fi

git fetch
local=$(git rev-parse $currentBranch);
remote=$(git rev-parse origin/$currentBranch);

echo "Local: $local";
echo "Remote: $remote";


if [ $local != $remote ]
then
    echo "Make sure your local branch that has been selected for deployment is the same as the remote branch."
    exit 2;
fi

source ~/.nvm/nvm.sh
nvm use 16
rm -rf node_modules
npm install
npm run build
cp envs/.env.prod .env

cd ..
rm backend.zip

zip -r backend.zip backend -x "backend/node_modules/*" "backend/public/*"

sftp ec2-user@13.235.80.169  << 'ENDSFTP'
    put ./backend.zip
ENDSFTP

ssh ec2-user@13.235.80.169   << 'ENDSSH'

source ~/.nvm/nvm.sh
nvm use 16
export NODE_ENV=production
pm2 delete resilio-api
mv backend/public public
rm -rf backend
unzip backend.zip
rm -rf backend.zip
mv public backend/public
cd backend
npm install
pm2 start --name resilio-api npm -- run start:prod
ENDSSH

cd backend
cp envs/.env.local .env