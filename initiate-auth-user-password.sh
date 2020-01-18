#!/bin/bash

client_id="5up5div5batr7kpj1g3ebvqsn2"
client_secret="17ve8h23dhft2gakjc1irbl6fjk4cr5a2854ot4b40jlpbn781ou"
secret_hash="uW+9Q0XDE6RyvSSGi2CFQfWxBloAmOQPFIi5KjKXgsI="
username="a@a.com"
password="aaaaaaaa"

json=$(aws cognito-idp initiate-auth \
    --output json \
    --client-id $client_id \
    --auth-flow USER_PASSWORD_AUTH \
    --auth-parameters "SECRET_HASH=$secret_hash,USERNAME=$username,PASSWORD=$password")

echo "$json"

refresh_token=$(echo $json | jq -r '.AuthenticationResult.RefreshToken')

echo "*** Refresh token: $refresh_token"

./initiate-auth-refresh-token.sh "$refresh_token"

