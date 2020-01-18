#!/bin/bash
refresh_token=""
client_id="5up5div5batr7kpj1g3ebvqsn2"
client_secret=""

aws cognito-idp initiate-auth \
    --output json \
    --client-id $client_id \
    --auth-flow REFRESH_TOKEN \
    --auth-parameters "REFRESH_TOKEN=$refresh_token,SECRET_HASH=$client_secret"
