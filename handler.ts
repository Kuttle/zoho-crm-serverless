import { sendToCRM, IBulkPost } from './src';

/**
 * set this to true if running for the very first time, it will generate your auth token using your refresh token
 * and ensure that it is placed in you spotinst key store
 */

const runningForTheFirstTime = false;
const moduleToPostTo = 'Leads';

// example IBulkPost...
// const input: IBulkPost = {
//   module: moduleToPostTo,
//   body: {
//     data: [
//       {
//         Company: 'kuttle',
//         Last_Name: 'test',
//         First_Name: 'test',
//         Email: 'test@test.com',
//         State: 'Pembrokeshire',
//         Country: 'Wales',
//       },
//     ],
//     trigger: ['workflow'],
//   },
// };

/**
 * main function expects a post event with a Form-Data object as the body - https://developer.mozilla.org/en-US/docs/Web/API/FormData
 * this is then parsed and converted into an IBulkPost
 * @export
 * @param {*} event
 * @param {*} context
 * @param {*} callback
 */
export function main(event, context, callback) {
  const result = JSON.parse(event.body);
  const bulkPostValues: IBulkPost = {
    module: moduleToPostTo,
    body: {
      data: [{ ...result }],
      trigger: ['workflow'],
    },
  };
  sendToCRM(bulkPostValues, context, runningForTheFirstTime).then(response => {
    callback(null, {
      statusCode: 200,
      body: `{"hello":"from NodeJS8.3 function"}`,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
