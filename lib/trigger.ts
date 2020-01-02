import * as cdk from "@aws-cdk/core"
import * as lambda from "@aws-cdk/aws-lambda"

export class Trigger extends cdk.Construct {
    readonly fn: lambda.Function

    constructor(scope: cdk.Construct, id: string) {
        super(scope, `trigger-${id}`)

        const fn = new lambda.Function(this, id,
            { runtime: lambda.Runtime.NODEJS_12_X
            , handler: `${id}-bundle.handler`
            , code: lambda.Code.fromAsset(`dist/lam/${id}-bundle.zip`)
            })
    }
}
