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

  , response = await fetch(authUrl, { redirect: "manual" })

  // determine if we login or not
  // if we login, munge the location header
  const index = response.headers.get("location")!.indexOf("/login?");
  const needsLogin = 0 <= index
  if (needsLogin) {
    const cognitoLoginUrl = response.headers.get("location");
    const pos = cognitoLoginUrl!.indexOf("/login?");
    const ourLoginUrl = "https://d39tieb4p8s7kr.cloudfront.net" + cognitoLoginUrl?.substring(pos + 6);
    response.headers.set("location", ourLoginUrl);
  }

  console.log("response", response.headers)

  return response
}

authorizeDelegate(
  { clientId: "5up5div5batr7kpj1g3ebvqsn2"
  , redirectUri: "https://d310yu246nep7l.cloudfront.net"
  }, {})
