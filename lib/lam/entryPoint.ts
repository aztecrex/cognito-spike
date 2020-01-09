import { APIGatewayEvent } from "aws-lambda"
import { Response } from "node-fetch"

import { authorize } from "./lib/authorization"
import { cognitoLogin } from "./lib/authCode"

const buildGatewayResponse = (res:Response) => {
  const cookie = res.headers.get("set-cookie")!.replace(
    "Domain=gofightwin.auth.us-east-1.amazoncognito.com; ", "")
  console.log("cookie", cookie)
  return { statusCode: res.status
    , headers: { "Access-Control-Allow-Origin": "*" }
    , body: JSON.stringify(
      { url: res.headers.get("location")
      , cookie
      })
    }
}

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  try {
    if (e.path == "/oauth2/authorize") {
      const res = await authorize(e)
      const gatewayReponse = buildGatewayResponse(res);
      return gatewayReponse;
    }

    if (e.path == "/login") {
      const loginResponse = await
        cognitoLogin(e.queryStringParameters, JSON.parse(e.body||""))
      return buildGatewayResponse(loginResponse);
    }
  } catch (e) { return Promise.reject(e) }
}
