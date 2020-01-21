import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CognitoSpike = require('../lib/pool');

import { authenticateUser } from "../lib/lam/lib/authCode"
authenticateUser(
