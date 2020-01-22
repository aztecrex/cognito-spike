import * as cdk from '@aws-cdk/core';
import { Pool } from './pool';
import { Website } from './website';
import { CognitoServer } from "./cognito-server"

const spikeId = process.env.SPIKE_ID || 'cognito-spike';
export class CognitoSpike extends cdk.Construct {
    constructor(scope: cdk.Construct) {
        super(scope, spikeId);

        const pool = new Pool(this);
        const foo = new Website(this, 'foo');
        const bar = new Website(this, 'bar');
        const baz = new Website(this, "baz");
        pool.addOwnSite(foo.url);
        pool.addOwnSite(bar.url);
        pool.addForeignSite("baz", baz.url);

        new Website(this, "login").store.grantPublicAccess()

        new CognitoServer(this)
    }
}
