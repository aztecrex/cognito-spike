import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import iam = require('@aws-cdk/aws-iam');

import { Trigger, LogTrigger } from "./trigger"

export class Pool extends cdk.Stack {

    private pool: cognito.CfnUserPool;
    private client: cognito.CfnUserPoolClient;

    constructor(scope: cdk.Construct) {
        super(scope, 'pool', {});

        const snsRole = new iam.Role(this, "UsersSNSRole", {
            assumedBy: new iam.ServicePrincipal("cognito-idp.amazonaws.com"),
        });
        const snsPublishPolicy = new iam.ManagedPolicy(this, "SNSPublish", {
            statements: [new iam.PolicyStatement(
                {
                    actions: ["sns:publish"],
                    resources: ['*'],
                }
            )],
        });
        snsRole.addManagedPolicy(snsPublishPolicy);

        this.pool = new cognito.CfnUserPool(this, "users", {
            autoVerifiedAttributes: ["email"],
            usernameAttributes: ["email"],
            policies: {
                passwordPolicy: {
                    minimumLength: 8,
                    requireLowercase: false,
                    requireUppercase: false,
                    requireNumbers: false,
                    requireSymbols: false,
                },
            },
            adminCreateUserConfig: {
                allowAdminCreateUserOnly: false,
            },
            mfaConfiguration: "OPTIONAL",
            enabledMfas: ["SMS_MFA", "SOFTWARE_TOKEN_MFA"],
            smsConfiguration: {
                externalId: "foobarId",
                snsCallerArn: snsRole.roleArn,
            },
            deviceConfiguration: {
                challengeRequiredOnNewDevice: true,
                deviceOnlyRememberedOnUserPrompt: false,
            },
            lambdaConfig: {
                createAuthChallenge: new Trigger(this, "createAuthChallenge").fn.functionArn,
                defineAuthChallenge: new Trigger(this, "defineAuthChallenge").fn.functionArn,
                verifyAuthChallengeResponse:
                    new Trigger(this, "verifyAuthChallengeResponse").fn.functionArn,
                // postAuthentication: new LogTrigger(this, "postAuthentication").fn.functionArn,
                // customMessage: new LogTrigger(this, "customMessage").fn.functionArn,
                // postConfirmation: new LogTrigger(this, "postConfirmation").fn.functionArn,
                // preAuthentication: new LogTrigger(this, "preAuthentication").fn.functionArn,
                // preSignUp: new LogTrigger(this, "preSignUp").fn.functionArn,
                // preTokenGeneration: new LogTrigger(this, "preTokenGeneration").fn.functionArn,
                // userMigration: new LogTrigger(this, "userMigration").fn.functionArn
            }
        });


        const domain = new cognito.CfnUserPoolDomain(this, "Domain", {
            domain: "gofightwin",
            userPoolId: this.pool.ref,
        });
        new cdk.CfnOutput(this, 'LoginUrl', {
            value: "https://" + domain.domain + ".auth.us-east-1.amazoncognito.com/",
        });


        const defaultCallback: string = 'https://platform.cj.com';
        this.client = new cognito.CfnUserPoolClient(this, "CJClient", {
            userPoolId: this.pool.ref,
            generateSecret: true,
            readAttributes: ["email"],
            writeAttributes: [],
            callbackUrLs: [defaultCallback],
            defaultRedirectUri: defaultCallback,
            supportedIdentityProviders: ["COGNITO"],
            logoutUrLs: ["https://platform.cj.com"],
            allowedOAuthFlows: ["code", "implicit",],
            explicitAuthFlows:
                [ "ALLOW_USER_PASSWORD_AUTH"
                , "ALLOW_REFRESH_TOKEN_AUTH"
                , "ALLOW_CUSTOM_AUTH"
                , "ALLOW_USER_SRP_AUTH"
                ],
            allowedOAuthScopes: ["email", "openid", "phone", "aws.cognito.signin.user.admin", "profile"],
            allowedOAuthFlowsUserPoolClient: true,
        });

        new cognito.CfnUserPoolResourceServer(this, 'resources', {
            identifier: 'all',
            name: "All",
            scopes: [
                {
                    scopeDescription: "All the things",
                    scopeName: "everything",
                },
            ],
            userPoolId: this.pool.ref,
        });
    }

    addOwnSite(callbackUrl: string) {
        const callbacks = this.client.callbackUrLs || [];
        this.client.callbackUrLs =  [callbackUrl, ...callbacks];

        var logouts = this.client.logoutUrLs || [];
        this.client.logoutUrLs = [callbackUrl, ...logouts];
    }

    addForeignSite(id: string, callbackUrl: string) {
        new cognito.CfnUserPoolClient(this, "foreign-client-" + id, {
            userPoolId: this.pool.ref,
            generateSecret: true,
            readAttributes: ["email"],
            writeAttributes: [],
            callbackUrLs: [callbackUrl],
            defaultRedirectUri: callbackUrl,
            supportedIdentityProviders: ["COGNITO"],
            logoutUrLs: [callbackUrl],
            allowedOAuthFlows: ["code", "implicit",],
            explicitAuthFlows:
                [ "ALLOW_USER_PASSWORD_AUTH"
                , "ALLOW_REFRESH_TOKEN_AUTH"
                , "ALLOW_CUSTOM_AUTH"
                , "ALLOW_USER_SRP_AUTH"
                ],
            allowedOAuthScopes: ["email", "openid", "all/everything"],
            allowedOAuthFlowsUserPoolClient: true,
        });
    }

}
