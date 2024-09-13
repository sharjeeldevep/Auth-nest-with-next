import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: `.env.development` });

export const getDb = async () => {
  const client = await MongoClient.connect(process.env.DB);
  return client.db();
};
