import * as AWS from "aws-sdk"
import fetch, { Headers, Response } from "node-fetch"
// @ts-ignore
global.fetch = fetch
import WindowMock from "window-mock"
// @ts-ignore
global.WindowMock = WindowMock;
import * as cookie from "cookie"
import * as FormData from "form-data"
import crypto = require("crypto")
import {AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession} from "amazon-cognito-identity-js";

AWS.config.region = "us-east-1"


interface ClientInfo {
  client_id: string
  redirect_uri: string
}

interface UserInfo {
  email: string
  pw: string
}

/*
change
DeviceName: "navigator.userAgent" in
node_modules/amazon-cognito-identity-js/lib/CognitoUser.js:525
 */
export const authenticateUser =
  async (x: ClientInfo | any, y: UserInfo): Promise<Response> => {
  const userPool = new CognitoUserPool({
    UserPoolId: "us-east-1_4OJDuhCXX",
    ClientId: x.client_id
  })

  const authenticationData = { Username: y.email, Password: y.pw }
  , authenticationDetails = new AuthenticationDetails(authenticationData)
  , cognitoUser = new CognitoUser(
    { Username: y.email
    , Pool: userPool
    })

  cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH");
  let p: Promise<any> = new Promise(function(resolve, reject) {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result: any) {
        var accessToken = result.getAccessToken().getJwtToken();
        resolve(accessToken)
      },

      onFailure: function(err: any) {
        console.log("Failed1!", err);
        // console.log("Failed!", JSON.stringify(err));

        reject("error")
      },
      customChallenge: function(challengeParameters: any) {
        console.log("challengeParameters", challengeParameters)
        let challengeResponses
        challengeResponses = 'yes';
        cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
      }
    })
  });
  const v = await p//.then((v)=>{console.log("done!", v); return v})
  console.log("done!", v)

  return v
}

export const cognitoLogin =
async (x: ClientInfo | any, y: UserInfo): Promise<Response> => {
  const cisp = new AWS.CognitoIdentityServiceProvider()
  , clientId = x.client_id
  , clientSecret = getClientSecretFromId(clientId)
  , secretHash = crypto.createHmac("sha256", clientSecret)
    .update(y.email).update(clientId).digest("base64")

  , params =
    { AuthFlow: "CUSTOM_AUTH"
    , ClientId: clientId
    , AuthParameters:
      { USERNAME: y.email
      // , PASSWORD: y.pw
      // , SRP_A: "a"
      , SECRET_HASH: secretHash
      , ChallengeName: "SRP_A"
      }
    }
  , res = await cisp.initiateAuth(params).promise().catch(console.log)
  console.log(res)

  const challengeParams =
    { ChallengeName: "PASSWORD_VERIFIER"
    , ClientId: clientId
    , ChallengeResponses:
      { PASSWORD_CLAIM_SIGNATURE: "foo"
      , PASSWORD_CLAIM_SECRET_BLOCK: "bar"
      // , TIMESTAMP: ""
      , USERNAME: y.email
      , SECRET_HASH: secretHash
      }
    }
  , challengeRes = await cisp.respondToAuthChallenge(challengeParams)
    .promise().catch(console.log)
  console.log(challengeRes)

  return new Response("STUB")
}

const getClientSecretFromId = (x: string): string => {
  let y = ""


  return y
}
