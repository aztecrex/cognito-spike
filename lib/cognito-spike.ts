import * as cdk from '@aws-cdk/core';
import { Pool } from './pool';
import { Website } from './webapp';

export class CognitoSpike extends cdk.Construct {
    constructor(scope: cdk.Construct) {
        super(scope, 'cognito-spike');

        const pool = new Pool(this);
        const foo = new Website(this, 'foo');
        const bar = new Website(this, 'bar');
        pool.addSite(["https://" + foo.store.bucketWebsiteDomainName]);
        pool.addSite(["https://" + bar.store.bucketWebsiteDomainName]);

    }
}
