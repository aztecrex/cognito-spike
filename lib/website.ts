import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { Duration } from '@aws-cdk/core';

export class Website extends cdk.Stack {

    readonly url: string;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, 'website-' + id);

        const store = new s3.Bucket(this, 'content', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const accessId = new cloudfront.OriginAccessIdentity(this, "WebId", {
            comment: "Web Identity for Static Site"
        });
        new AccessIdReadPolicy(this, store, accessId);

        const cdn = new cloudfront.CloudFrontWebDistribution(this, "CDN", {
            originConfigs: [{
                s3OriginSource: {
                    s3BucketSource: store,
                    originAccessIdentity: accessId
                },
                behaviors: [{
                    isDefaultBehavior: true,
                    allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                    minTtl: Duration.minutes(1),
                    defaultTtl: Duration.minutes(1),
                    maxTtl: Duration.minutes(5),
            }],}],
        });

        this.url = "https://" + cdn.domainName;

        new cdk.CfnOutput(this, `${id}ContentStore`, {
            value: store.bucketName,
        });
        new cdk.CfnOutput(this, `${id}Url`, {
            value: this.url,
        });
    }

}

class AccessIdBucketReadAnyStatement extends iam.PolicyStatement {
    constructor(bucket: s3.Bucket, accessId: cloudfront.OriginAccessIdentity) {
        super();
        this.effect = iam.Effect.ALLOW;
        this.addActions('s3:GetObject');
        this.addResources(bucket.arnForObjects('*'));
        this.addCanonicalUserPrincipal(accessId.cloudFrontOriginAccessIdentityS3CanonicalUserId);
    }
}

class AccessIdReadPolicy extends s3.BucketPolicy {
    accessId: cloudfront.OriginAccessIdentity;

    constructor(scope: cdk.Construct, bucket: s3.Bucket, accessId: cloudfront.OriginAccessIdentity) {
        super(scope, bucket.node.id + "AccessIdReadAccess", {
            bucket: bucket
        });
        this.document.addStatements(new AccessIdBucketReadAnyStatement(bucket, accessId));
        this.accessId = accessId;
    }
}
