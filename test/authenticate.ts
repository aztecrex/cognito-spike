import * as AWS from 'aws-sdk';
import { normalize } from 'path';
import * as crypto from 'crypto';

require('dotenv').config();

AWS.config.region='us-east-1';
const Cognito = new AWS.CognitoIdentityServiceProvider();

async function authenticate() {

    const clientId = process.env.CLIENT_ID || '';
    const clientSecret = process.env.CLIENT_SECRET || '';

    const user = 'a@a.com';
    const pass = 'aaaaaaaa';

    const parms = {
        // AuthFlow: USER_SRP_AUTH | REFRESH_TOKEN_AUTH | REFRESH_TOKEN | CUSTOM_AUTH | ADMIN_NO_SRP_AUTH | USER_PASSWORD_AUTH | ADMIN_USER_PASSWORD_AUTH, /* required */
        AuthFlow: "USER_PASSWORD_AUTH", /* required */
        ClientId: clientId, /* required */
        AuthParameters: {
            USERNAME: user,
            PASSWORD: pass,
            SECRET_HASH: crypto.createHmac("sha256", clientSecret)
            .update(user).update(clientId).digest("base64"),
        },
        // ClientMetadata: {
        //   '<StringType>': 'STRING_VALUE',
        //   /* '<StringType>': ... */
        // },
        // UserContextData: {
        //   EncodedData: 'STRING_VALUE'
        // }
      };

    const result = await Cognito.initiateAuth(parms).promise().catch(console.log);
    console.log(JSON.stringify(result));
    return result;

}

authenticate();
