#!/bin/bash

Authorization="Basic "
ContentType="application/x-www-form-urlencoded"
AuthorizationCode="" # go from bar to foo then paste the authorization code here
RedirectUri="https://d2lgb2i3e3ysi4.cloudfront.net" 

curl -X POST \
-H "Authorization: $Authorization" \
-H "Content-Type: $ContentType" \
-d "grant_type=authorization_code&code=$AuthorizationCode&redirect_uri=$RedirectUri" \
https://gofightwin.auth.us-east-1.amazoncognito.com/oauth2/token \
| python -m json.tool