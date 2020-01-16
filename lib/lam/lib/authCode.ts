import * as AWS from "aws-sdk"
import { Response } from "node-fetch"
import crypto = require("crypto")

AWS.config.region = "us-east-1"

interface ClientInfo {
  client_id: string
  redirect_uri: string
}

interface UserInfo {
  email: string
  pw: string
}

export const cognitoLogin =
async (x: ClientInfo | any, y: UserInfo): Promise<Response> => {
  const cisp = new AWS.CognitoIdentityServiceProvider()
  , clientId = x.client_id
  , clientSecret = getClientSecretFromId(clientId)
  , secretHash = crypto.createHmac("sha256", clientSecret).update(y.email)
    .update(clientId).digest("base64")
  , params =
    { AuthFlow: "CUSTOM_AUTH"
    , UserPoolId: "us-east-1_4OJDuhCXX"
    , ClientId: clientId
    , AuthParameters:
      { USERNAME: y.email
      // , SRP_A: "a1827509dacc6fa1a8f818aec4462b4459b85f1b75a52865ebedf45dc90c01ef183ec85dbe2356a865a08654cf7d6975ac4bedcedc45e3ec40d82a746ee92afa97e29a982aba4b79e688e05f69a77f074676718576595daa23a91d8e24ca0092045cab5e4f46a2dce895282857f3f521b6dc1302fd4ecd79abe5a94bb64a20693eeff5cf94ccb48febba7e011313db8185bc87714d8e14440d3d27d356f5e91c46cd365f2a594edcfb694c2a784070d98d1b136899b538fe48b953ce059a58691ce32fc94db4623134f7649f0b8f0dd427612ff451a882d8167fa745245ca77591cd836a250e44fc95eb6f357e21d627ee89d19e764041642886d96d2acba3b2"
      // , PASSWORD: y.pw
      , SECRET_HASH: secretHash
      }
    }

  , res = await cisp.adminInitiateAuth(params).promise().catch(console.log)
  console.log(res)

  const challengeParams =
    { ChallengeName: "ADMIN_NO_SRP_AUTH"
    , ClientId: clientId
    , UserPoolId: "us-east-1_4OJDuhCXX"
    , ChallengeResponses:
      { PASSWORD: y.pw
      , USERNAME: y.email
      , SECRET_HASH: secretHash
      }
    }
  , challengeRes = await cisp.adminRespondToAuthChallenge(challengeParams)
    .promise().catch(console.log)
  console.log(challengeRes)

  return new Response("STUB")
}

const getClientSecretFromId = (x: string): string => {
  let y = ""

  return y
}
