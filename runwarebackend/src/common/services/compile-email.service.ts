import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import mjml2html from 'mjml';

type Props = {
  fileName: string;
  data: {
    name?: string;
    email?: string;
    password?: string;
    code?: string;
    link?: string;
  };
};

export default async function compileEmailTemplate({
  fileName,
  data,
}: Props): Promise<string> {
  const mjMail = await fs.promises.readFile(
    path.join('src/common/mjml-templates', fileName),
    'utf8',
  );
  const template = mjml2html(mjMail).html;
  return handlebars.compile(template)(data).toString();
}
