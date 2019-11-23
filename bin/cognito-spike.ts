#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { CognitoSpike } from '../lib/cognito-spike';

const app = new cdk.App();
new CognitoSpike(app);
