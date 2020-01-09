import * as cdk from '@aws-cdk/core';
import { Pool } from './pool';
import { Website } from './website';
import { CognitoServer } from "./cognito-server"

export class CognitoSpike extends cdk.Construct {
    constructor(scope: cdk.Construct) {
        super(scope, 'cognito-spike');

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
