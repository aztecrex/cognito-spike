import { APIGatewayEvent } from "aws-lambda"
import { Response } from "node-fetch"

import { authorize } from "../../src/authorization"
import { cognitoLogin } from "../../src/authCode"

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
    const res = await authorize(e)
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
