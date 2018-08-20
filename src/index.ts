import { initialise, IZCRMRestClient } from 'zoho-crm-nodejs-sdk';
import { buildInit, IConfigJSON } from './config';

export interface IFields {
  [key: string]: string|Array<string>;
}

export interface IBulkPost {
  module: string;
  body: {
    data: IFields[];
    trigger?: string[];
  };
}
/**
 * handles creating the storage module that is required for peristing your OAuth2.0 token and refreshing it if it is out of date.
 * it then initialises the ZCRMRestClient with that storage module, and then handles updating your CRM with the passed in IBulkPost data.
 *
 * if `runningForTheFirstTIme` is set to true, then it will generate your auth token using the refresh token and will store it in the
 * spotinst key value store. once this function has been run once, you can set the value to false and call `serverless deploy`. in this way your token
 * isn't recreated on every call, and instead uses the one in your spotinst key value store. if the one in your key value store expires,
 * zoho-crm-nodejs-sdk handles the recreation of a new auth token.
 *
 * note: zoho-crm-nodejs-sdk is basically a carbon copy of https://www.zoho.com/crm/help/developer/server-side-sdks/node-js.html
 * their module was doing a `require(ENV_VARIABLE_THAT_HAD_YOUR_STORAGE_MODULE)` statement. the problem with this is that you cannot initialise
 * a require statement with runtime parameters. since the spotinst key value store requires the context from the serverelss function to get values
 * from the key value store we needed our modules 'constructor' to have that passed in at run time. so all I changed is that their 'mysql_module' that used to accept
 * a string that was used for the require statement now accepts an object of type IStorage that has the same object signature of that of an module that would have been imported.
 * I then had to find all the locations where that string was used to then do a module import, and instead have it use the passed in object directly.
 *
 * @export
 * @param {IBulkPost} bulkPostValues
 * @param {*} context
 * @param {boolean} runningForTheFirstTime
 * @returns {Promise<any>}
 */
export function sendToCRM(
  bulkPostValues: IBulkPost,
  context: any,
  runningForTheFirstTime: boolean
): Promise<any> {
  const saveLoad: IConfigJSON = buildInit(context);
  //console.log(`logging our saveLoad: ${JSON.stringify(saveLoad)}`);
  return initialise(saveLoad)
    .then((ZCRMRestClient: IZCRMRestClient) => {
      if (runningForTheFirstTime) {
        return ZCRMRestClient.generateAuthTokenfromRefreshToken(
          undefined,
          saveLoad.refresh_token
        ).then(() => {
          return [ZCRMRestClient];
        });
      } else {
        return [ZCRMRestClient];
      }
    })
    .then(([ZCRMRestClient]: [IZCRMRestClient]) => {
      return ZCRMRestClient.API.MODULES.post(bulkPostValues);
    });
}
