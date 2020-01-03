import { APIGatewayEvent } from "aws-lambda"
import { Response } from "node-fetch"

import { AuthorizationEndpoint } from "./authorization"
import { cognitoLogin } from "./authCode"

const buildGatewayResponse = (res:Response) => {
  const headers: {[k: string]: string} = { "Access-Control-Allow-Origin": "*" }
  res.headers.forEach((v, k) => {
    headers[k] = v
  })
  return { statusCode: res.status
    , headers: headers
    , body: res.body
  }
}

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  console.log("method", e.httpMethod)
  console.log("path", e.path)

  if (e.path == "/oauth2/authorize") {
    const res = await AuthorizationEndpoint.authorize(e)
    const gatewayReponse = buildGatewayResponse(res);
    console.log(gatewayReponse);
    return gatewayReponse;
  }

  if (e.path == "/login") {
    const loginResponse = await
      cognitoLogin(e.queryStringParameters, JSON.parse(e.body||""))
    console.log(loginResponse)
    return buildGatewayResponse(loginResponse);
  }
}
