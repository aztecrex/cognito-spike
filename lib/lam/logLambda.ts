import { APIGatewayEvent } from "aws-lambda"

exports.handler = async (event: APIGatewayEvent) => {
    console.log("event", event)
}
