import * as AWS from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"
import fetch from "node-fetch"
import { Response } from "node-fetch"

import crypto = require("crypto")

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify({ "message": "Hello World!" })
  }

  await authCodeProxy(e.queryStringParameters, JSON.parse(e.body||""))

  return response
}

export const authCodeProxy =
async (x: any, y: any): Promise<Response> => {
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

  , url = `https://${authDomain}/oauth2/authorize?response_type=${responseType}`
    + `&client_id=${clientId}&redirect_uri=${redirectUri}`
    + `&code_challenge_method=${codeChallengeMethod}`
    + `&code_challenge=${challenge}`

  , res = await fetch(url)
  console.log("res", res)
  console.log("headers", res.headers)
  console.log("body", res.body)

  return res
}

const getClientSecretFromId = (x: string): string => {
  return ""
}

authCodeProxy(
  { client_id: "5up5div5batr7kpj1g3ebvqsn2"
  , redirect_uri: "https://d2lgb2i3e3ysi4.cloudfront.net"
  }, { email: "a@a.com", pw: "aaaaaaaa" })
