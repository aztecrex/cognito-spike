#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CognitoSpikeStack } from '../lib/cognito-spike-stack';

const app = new cdk.App();
new CognitoSpikeStack(app, 'CognitoSpikeStack');
