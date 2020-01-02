import * as AWS from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"
import fetch, { Headers } from "node-fetch"
import * as cookie from "cookie"
import * as FormData from "form-data"
import crypto = require("crypto")
import querystring = require("querystring")

AWS.config.region = "us-east-1"

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  const authCodeRes= await
    authCodeProxy(e.queryStringParameters, JSON.parse(e.body||""))

  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true
    },
    body: JSON.stringify(authCodeRes)
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

interface ProxyReturn {
  url: string
  id_token: string
  access_token: string
  refresh_token: string
}

export const authCodeProxy =
async (x: ClientInfo | any, y: UserInfo): Promise<ProxyReturn> => {
  const authDomain = "gofightwin.auth.us-east-1.amazoncognito.com"
  , clientId = x.client_id
  , clientSecret = getClientSecretFromId(clientId)
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
    + `&code_challenge_method=${codeChallengeMethod}&code_challenge=${challenge}`

  , csrfRes = await fetch(csrfUrl)
  , csrfRedirect = csrfRes.url
  , csrfToken = cookie.parse(csrfRes.headers.get("set-cookie")||"")["XSRF-TOKEN"]

  , authCodeForm = makeFormData(
    { "_csrf": csrfToken
    , "username": username
    , "password": password
    })
  , authCodeRes = await fetch(csrfRedirect,
    { headers: new Headers({ "Cookie": `XSRF-TOKEN=${csrfToken}; Path=/; Secure; HttpOnly` })
    , method: "POST"
    , body: authCodeForm
    })
  , i = authCodeRes.url.indexOf("?code=")
  , authCode = authCodeRes.url.substring(i + "?code=".length)

  , authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  , tokenResponse = await fetch(`https://${authDomain}/oauth2/token`,
    { headers: new Headers(
      { "Authorization": `Basic ${authorization}`
      , "Content-Type": "application/x-www-form-urlencoded"
      })
    , method: "POST"
    , body: querystring.stringify(
      { "grant_type": "authorization_code"
      , "client_id": clientId
      , "code": authCode
      , "redirect_uri": redirectUri
      , "code_verifier": verifier
      })
    })
  , tokens = await tokenResponse.json()

  return { url: authCodeRes.url, ...tokens, authCode }
}

const makeFormData = (x: any) => {
  const y = new FormData()
  Object.keys(x).forEach(k => {
    y.append(k, x[k])
  })

  return y
}

const getClientSecretFromId = (x: string): string => {
  return ""
}

const hmac = crypto.createHmac("sha256", getClientSecretFromId(""))
const secretHash = hmac.update("a@a.com").update("5up5div5batr7kpj1g3ebvqsn2").digest("base64")
const cisp = new AWS.CognitoIdentityServiceProvider()
const params =
  { AuthFlow: "CUSTOM_AUTH"
  , ClientId: "5up5div5batr7kpj1g3ebvqsn2"
  , AuthParameters:
    { USERNAME: "a@a.com"
    , SECRET_HASH: secretHash
    }
  }

cisp.initiateAuth(params, (e, d) => {
  if (e) { console.log(e); return }
  console.log(d)
})
