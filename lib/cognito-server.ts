import * as apigateway from "@aws-cdk/aws-apigateway"
import * as cdk from "@aws-cdk/core"
import * as iam from "@aws-cdk/aws-iam"
import * as lambda from "@aws-cdk/aws-lambda"

export class CognitoServer extends cdk.Stack {
  constructor(scope: cdk.Construct) {
    super(scope, "cognito-server")

    new Servlet(this, "entryPoint")
  }
}

class Servlet extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, "servlet-" + id)

    const fn = new lambda.Function(this, id,
      { runtime: lambda.Runtime.NODEJS_12_X
      , handler: `${id}-bundle.handler`
      , code: lambda.Code.fromAsset(`dist/lam/${id}-bundle.zip`)
      , role: iam.Role.fromRoleArn(this,
        "lambda-role", "arn:aws:iam::114272735376:role/lambda")
      })

    , api = new apigateway.LambdaRestApi(this, `${id}-api`, { handler: fn })

    // api.root.addMethod("POST", new apigateway.LambdaIntegration(fn))

    new cdk.CfnOutput(this, `${id}Url`, { value: api.url })
  }
}
