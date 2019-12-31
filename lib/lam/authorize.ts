import * as AWS from "aws-sdk"
import { APIGatewayEvent } from "aws-lambda"

export const handler = async (e: APIGatewayEvent): Promise<any> => {
  console.log(e)
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*", // Required for CORS support to work
      "Access-Control-Allow-Credentials": true // Required for cookies, authorization headers with HTTPS
    },
    body: JSON.stringify({ "message": "Hello World!" })
  }

  return response
}
