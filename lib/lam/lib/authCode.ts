import * as AWS from "aws-sdk"
import fetch, { Headers, Response } from "node-fetch"
import * as cookie from "cookie"
import * as FormData from "form-data"
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
  , hmac = crypto.createHmac("sha256", clientSecret)
  , secretHash = hmac.update(y.email).update(clientId).digest("base64")
  , params =
    { AuthFlow: "CUSTOM_AUTH"
    , ClientId: clientId
    , AuthParameters:
      { USERNAME: y.email
      , SRP_A: "1001"
      , PASSWORD: y.pw
      , SECRET_HASH: secretHash
      }
    }

  , res = await cisp.initiateAuth(params).promise().catch(console.log)
  console.log(res)

  // if clientId is baz, then go through custom auth flow

  return new Response("STUB")
}

export const stubLoginDeleteLater =
async (): Promise<Response> => {
  const y : UserInfo = {
    email: "a@a.com",
    pw: "aaaaaaaa"
  }
  const cisp = new AWS.CognitoIdentityServiceProvider()
  , clientId = "5up5div5batr7kpj1g3ebvqsn2"
  , clientSecret = getClientSecretFromId(clientId)
  , hmac = crypto.createHmac("sha256", clientSecret)
  , secretHash = hmac.update(y.email).update(clientId).digest("base64") 
  , params =
    { AuthFlow: "USER_PASSWORD_AUTH"
    , ClientId: clientId
    , AuthParameters:
      { USERNAME: y.email
      //, SRP_A: "1001"
      , PASSWORD: y.pw
      , DEVICE_KEY: '1234567890'
      , SECRET_HASH: "" //secretHash
      }
    }
  , res = await cisp.initiateAuth(params).promise().catch(a => console.log("catch statement1: " + a))
  , tokens = JSON.parse(await new Response(JSON.stringify(res)).text())
  , refreshAuthRes = await cisp.initiateAuth({
     AuthFlow: "REFRESH_TOKEN",
     ClientId: clientId,
     AuthParameters:
     {REFRESH_TOKEN: tokens.AuthenticationResult.RefreshToken, 
      SECRET_HASH: ""
     }
  }).promise().catch(a => console.log("catch statement2: " + a))
  console.log("response", JSON.stringify(res))
  console.log("secret hash", secretHash)
  console.log("funky tokens call", tokens)
  console.log("refreshAuthRes", refreshAuthRes)
  return new Response(JSON.stringify(res))
}

export const cognitoLoginOld =
async (x: ClientInfo | any, y: UserInfo): Promise<Response> => {
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
    // + `&code_challenge_method=${codeChallengeMethod}&code_challenge=${challenge}`

  , csrfRes = await fetch(csrfUrl)
  , csrfRedirect = csrfRes.url
  , csrfToken = cookie.parse(csrfRes.headers.get("set-cookie")||"")["XSRF-TOKEN"]

  , authCodeRes = await fetch(csrfRedirect,
    { headers: new Headers(
      { "Cookie": `XSRF-TOKEN=${csrfToken}; Path=/; Secure; HttpOnly`})
    , method: "POST"
    , body: makeFormData(
      { "_csrf": csrfToken
      , "username": username
      , "password": password
      })
    , redirect: "manual"
    })
  , i = authCodeRes.url.indexOf("?code=")
  , authCode = authCodeRes.url.substring(i + "?code=".length)

  return authCodeRes

  // , authorization = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  // , tokenResponse = await fetch(`https://${authDomain}/oauth2/token`,
  //   { headers: new Headers(
  //     { "Authorization": `Basic ${authorization}`
  //     , "Content-Type": "application/x-www-form-urlencoded"
  //     })
  //   , method: "POST"
  //   , body: querystring.stringify(
  //     { "grant_type": "authorization_code"
  //     , "client_id": clientId
  //     , "code": authCode
  //     , "redirect_uri": redirectUri
  //     , "code_verifier": verifier
  //     })
  //   })
  // , tokens = await tokenResponse.json()

  // console.log(tokenResponse)

  // return { url: authCodeRes.url/*, ...tokens*/, authCode }
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

// const hmac = crypto.createHmac("sha256", getClientSecretFromId(""))
// const secretHash = hmac.update("a@a.com").update("5up5div5batr7kpj1g3ebvqsn2").digest("base64")
// const cisp = new AWS.CognitoIdentityServiceProvider()
// const params =
//   { AuthFlow: "CUSTOM_AUTH"
//   , ClientId: "5up5div5batr7kpj1g3ebvqsn2"
//   , AuthParameters:
//     { USERNAME: "a@a.com"
//     , SECRET_HASH: secretHash
//     }
//   }

// cisp.initiateAuth(params, (e, d) => {
//   if (e) { console.log(e); return }
//   console.log(d)
// })
