import { APIGatewayEvent } from "aws-lambda"
import { Response } from "node-fetch"

import { authorize } from "./lib/authorization"
import { cognitoLogin } from "./lib/authCode"

interface AuthResponse {
  statusCode: number
  headers: Object
  body: string
}

const buildGatewayResponse = (res: Response): AuthResponse => {
  const cookie = res.headers.get("set-cookie")?.replace(
    "Domain=gofightwin.auth.us-east-1.amazoncognito.com; ", "")
  // console.log("cookie", cookie)
  return (
    { statusCode: res.status
    , headers: { "Access-Control-Allow-Origin": "*" }
    , body: JSON.stringify(
      { url: res.headers.get("location")
      , cookie
      })
    })
}

export const handler = async (e: APIGatewayEvent): Promise<AuthResponse> => {
  try {
    let res: Response
    if (e.path == "/oauth2/authorize") {
      res = await authorize(e)
    } else if (e.path == "/login") {
      res = await
        cognitoLogin(e.queryStringParameters, JSON.parse(e.body||""))
    } else {
      throw new Error("route not supported")
    }

    return buildGatewayResponse(res)
  } catch (e) { return Promise.reject(e) }
}
