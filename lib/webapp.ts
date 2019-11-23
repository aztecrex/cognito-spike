import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { CfnOutput } from '@aws-cdk/core';
import { Bucket } from '@aws-cdk/aws-s3';

export class Website extends cdk.Stack {

    readonly store: Bucket;

    constructor(scope: cdk.Construct, id: string) {
        super(scope, 'website-' + id);

        this.store = new s3.Bucket(this, 'content', {
            accessControl: s3.BucketAccessControl.PUBLIC_READ,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'error.html',

        });

        new CfnOutput(this, `${id}ContentStore`, {
            value: this.store.bucketName,
        });
        new CfnOutput(this, `${id}Url`, {
            value: this.store.bucketWebsiteUrl,
        });
    }

}
