import { APIGatewayEvent } from "aws-lambda";
import fetch, { Response } from "node-fetch"

const authDomain = "gofightwin.auth.us-east-1.amazoncognito.com"

export const authorize = (e: APIGatewayEvent) => {
  const params = e.queryStringParameters || {}
  , clientId = params.client_id
  , redirectUri = params.redirect_uri

  return authorizeDelegate({clientId, redirectUri}, {})
}

const authorizeDelegate =
async ({clientId, redirectUri}: any, {username, password}: any): Promise<Response> => {
  const authUrl = `https://${authDomain}/oauth2/authorize?response_type=code`
    + `&client_id=${clientId}&redirect_uri=${redirectUri}`

  const response = await fetch(authUrl, { redirect: "manual" })
  console.log("authorize response", response)

  // determine if we log in or not
  // if we log in, munge the location header
  const index = response.headers.get("location")!.indexOf("/login?")
  , needsLogin = 0 <= index
  if (needsLogin) {
    const cognitoLoginUrl = response.headers.get("location")
    , pos = cognitoLoginUrl!.indexOf("/login?")
    , ourLoginUrl = "https://d39tieb4p8s7kr.cloudfront.net"
      + cognitoLoginUrl?.substring(pos + 6);
    response.headers.set("location", ourLoginUrl);
  }

  return response
}

// authorizeDelegate(
//   { clientId: "5up5div5batr7kpj1g3ebvqsn2"
//   , redirectUri: "https://d310yu246nep7l.cloudfront.net"
//   }, {})
