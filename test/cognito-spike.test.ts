import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CognitoSpike = require('../lib/cognito-spike-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new CognitoSpike.CognitoSpikeStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});