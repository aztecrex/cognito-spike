import cdk = require('@aws-cdk/core');
import cognito = require('@aws-cdk/aws-cognito');
import iam = require('@aws-cdk/aws-iam');

export class CognitoSpikeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


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

    const pool = new cognito.CfnUserPool(this, "users", {
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
      mfaConfiguration: "ON",
      enabledMfas: ["SMS_MFA"],
      smsConfiguration: {
        externalId: "foobarId",
        snsCallerArn: snsRole.roleArn,
      },
      deviceConfiguration: {
        challengeRequiredOnNewDevice: true,
        deviceOnlyRememberedOnUserPrompt: false,
      }

    });

    new cognito.CfnUserPoolClient(this, "CJClient", {
      userPoolId: pool.ref,
      generateSecret: true,
      readAttributes: ["email"],
      writeAttributes: [],
      callbackUrLs: ["https://demo1.cj.com/"],
      defaultRedirectUri: "https://demo1.cj.com/",
      supportedIdentityProviders: ["COGNITO"],
      logoutUrLs: ["https://demo1.cj.com/logout"],
      allowedOAuthFlows: ["code"],
      allowedOAuthScopes: ["email", "openid"],
      allowedOAuthFlowsUserPoolClient: true,
    });

    new cognito.CfnUserPoolDomain(this, "Domain", {
      domain: "imacomputer",
      userPoolId: pool.ref,
    });


  }
}
