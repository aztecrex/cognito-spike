import { APIGatewayEvent } from "aws-lambda"
import { Response } from "node-fetch"

import { authorize } from "./lib/authorization"
import { cognitoLogin, stubLoginDeleteLater } from "./lib/authCode"

import * as AWS from "aws-sdk"
// import * as cognito from "aws-cognito"

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
      return buildGatewayResponse(res)
    } else if (e.path == "/login") {
      res = await
        cognitoLogin(e.queryStringParameters, JSON.parse(e.body||""))
        return buildGatewayResponse(res)
    } else if (e.path == "/global-logout") {
      const accessToken =  e.headers.Authorization
      if (!accessToken) {        
        return Promise.reject(e)
      }
      var params = {
        AccessToken: accessToken
      };
      const cisp = new AWS.CognitoIdentityServiceProvider()
      const globalSignOutResponse 
      = await cisp.globalSignOut(params).promise().catch(a => console.log("sign out request thing: " + a))
      console.log("globalSignOutResponse", globalSignOutResponse)
          
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: "ya logged out"
      }      
    } else if (e.path == "/login-stub") {
      const loginResponse: Response = await stubLoginDeleteLater()
      const tokens = await loginResponse.text()
      console.log("login-stub: " + tokens)
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: tokens
      }
    }
    else {
      throw new Error("route not supported")
    }
  } catch (e) { return Promise.reject(e) }
}