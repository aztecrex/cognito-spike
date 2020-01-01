import * as AWS from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"
import fetch, { Headers, Response } from "node-fetch"
import * as cookie from "cookie"
import * as FormData from "form-data"

import crypto = require("crypto")

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  const authCodeRes= await authCodeProxy(e.queryStringParameters,
    JSON.parse(e.body||""))

  , response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({ url: authCodeRes.url })
  }

  return response
}

interface ClientInfo {
  client_id: string
  redirect_uri: string
}

interface UserInfo {
  email: string
  pw: string
}

export const authCodeProxy =
async (x: ClientInfo | any, y: UserInfo): Promise<{ url: string }> => {
  const authDomain = "gofightwin.auth.us-east-1.amazoncognito.com"
  , clientId = x.client_id
  , clentSecret = getClientSecretFromId(clientId)
  , responseType = "code"
  , redirectUri = x.redirect_uri

  , username = y.email
  , password = y.pw

  , codeChallengeMethod = "S256"

  , base64URLEncode = (str: any) =>
    str.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g,'_')
      .replace(/=/g, '')
  , sha256 = (buffer: any) => crypto.createHash("sha256").update(buffer).digest()

  , verifier = base64URLEncode(crypto.randomBytes(32))
  , challenge = base64URLEncode(sha256(verifier))

  , csrfUrl = `https://${authDomain}/oauth2/authorize?response_type=${responseType}`
    + `&client_id=${clientId}&redirect_uri=${redirectUri}`
    + `&code_challenge_method=${codeChallengeMethod}`
    + `&code_challenge=${challenge}`

  , csrfRes = await fetch(csrfUrl)
  , redirect = csrfRes.url
  , csrfToken = cookie.parse(csrfRes.headers.get("set-cookie")||"")["XSRF-TOKEN"]

  , authCodeForm = new FormData()
  authCodeForm.append("_csrf", csrfToken)
  authCodeForm.append("username", username)
  authCodeForm.append("password", password)
  const authCodeRes = await fetch(redirect,
    { headers: new Headers({ "Cookie": `XSRF-TOKEN=${csrfToken}; Path=/; Secure; HttpOnly` })
    , method: "POST"
    , body: authCodeForm
    })

  // get and return tokens

  return { url: authCodeRes.url }
}

const getClientSecretFromId = (x: string): string => {
  return ""
}
