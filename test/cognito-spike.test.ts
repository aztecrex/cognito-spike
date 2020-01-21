import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import CognitoSpike = require('../lib/pool');

import { authenticateUser } from "../lib/lam/lib/authCode"
authenticateUser(
    { client_id: "4n8eo9c4oceccbfr1k8plm4pdi"
, redirect_uri: "https://d1gqrvag8c8eck.cloudfront.net"
    }, { email: "b@b.com", pw: "bbbbbbbb" })
