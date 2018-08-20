import { init, IStorage } from 'zoho-crm-serverless-spotinst-storage';
export interface IConfigJSON {
  client_id: string;
  client_secret: string;
  redirect_url: string;
  iamurl: string;
  mysql_module: IStorage; // TODO: export type from
  refresh_token?: string;
  baseurl?: string;
  version?: string;
}
export function buildInit(context): IConfigJSON {
  return {
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_url: process.env.REDIRECT_URL,
    iamurl: process.env.IAM_URL,
    mysql_module: init(
      context,
      process.env.SPOTINST_ACCOUNT,
      process.env.SPOTINST_TOKEN,
      process.env.SPOTINST_ENVIRONMENT
    ),
    refresh_token: process.env.REFRESH_TOKEN,
  };
}
