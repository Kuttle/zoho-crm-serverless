# Introduction

This is a [spotinst serverless function](https://spotinst.com/products/spotinst-functions/) that is invoked via a public HTTPS request with the correct zoho fields passed as a json object in the body. It then parses this data and pushes those details into your [Zoho CRM](https://www.zoho.com/crm/?zmc=zoho-fa). This is perfect for calling from a custom form on your website to capture leads. It is currently used by us (https://kuttle.io) to capture any of our potential clients.

# Quick start for the Zoho CRM Rest API

If you already have configured your `Zoho Client ID` and have generated your activation and request tokens then you can skip ahead to [Configuration](#Configuration) below.

I strongly suggest you read the docs for yourself here: https://www.zoho.com/crm/help/api/v2/#api-reference

However, that said, sometimes its nice to just get going. For this I will lean heavily on this great NPM module located [here](https://www.npmjs.com/package/zcrm-oauth2).

This module guides you through the creation of your Zoho Client ID and then helps you generate your first `access token` and the `refresh token` that's used to generate `activation tokens` in future. One thing I would suggest is limiting the access that your `Zoho Client ID` has. I only needed read/write access to the `Leads` area of zoho. so my `auth.json` file looked like this:

```json
{
  "id": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "secret": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "redirect": "http://localhost:8000/",
  "scope": "ZohoCRM.modules.Leads.CREATE",
  "location": "com"
}
```

# Configuration

Configuration is done by modifying the environment variables inside the `serverless.yml` file (if someone knows a nice way of inject `*.env` files I would appreciate a pull request). By default it uses [zoho-crm-serverless-spotinst-storage](https://github.com/Kuttle/zoho-crm-serverless-spotinst-storage) as the token storage mechanism and leverages [spotinst's document store](https://help.spotinst.com/hc/en-us/articles/115005949369-Using-Document-Store-SDK) for saving and retrieving the OAuth tokens between function calls. It is currently configured to use the [bulk Records APIs](https://www.zoho.com/crm/help/api/v2/#ra-insert-records). However if that is not appropriate for your use case, forking this repo and making small edits should get the job done.

## Running for the first time

So, you have Setup your `Zoho Client ID`, have setup all the environment variables in the `serverless.yml` file, all thats left to do is go into the handler.ts file and set:

```typescript
const runningForTheFirstTime = true;
```

This causes the serverless function to generate an auth token using the refresh token and store all of this in the serverless key value store. Once this function has run once (triggered from your webform, or curl), then you can set:

```typescript
const runningForTheFirstTime = false;
```

## How do I call this serverless function from client side JS?

here's a snippet of code (with our actual function name modifed...) from our gatsby site.

```js
handleSubmit = event => {
    this.formLoading()
    event.preventDefault()
    fetch(
      'https://app-fake-env-prod-execute-function1.spotinst.io/fx-fake-function',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Company: this.state.Company,
          First_Name: this.state.First_Name,
          Last_Name: this.state.Last_Name,
          City: this.state.City,
          Country: this.state.Country,
          Email: this.state.Email,
          Phone: this.state.Phone,
          Description: this.state.Description,
        }),
        mode: 'cors',
      }
    )
      .then(response => {
        if (response.ok) {
          this.formConfirmed()
        } else {
          this.formError()
        }
      })
      .catch(err => {
        this.formError()
      })
```
# Links

For more in depth information on the Storage mechanism for storing OAuth Tokens between function calls see here: https://github.com/Kuttle/zoho-crm-serverless-spotinst-storage

For indepth information on our typescript friendly zoho crm sdk see here: https://github.com/Kuttle/zoho-crm-nodejs-sdk
