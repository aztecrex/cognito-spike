#!/bin/bash
Authorization="Basic "
ContentType="application/x-www-form-urlencoded"
RefreshToken=""

curl -X POST \
-H "Authorization: $Authorization" \
-H "Content-Type: $ContentType" \
-d "grant_type=refresh_token" \
-d "refresh_token=$RefreshToken" \
https://gofightwin.auth.us-east-1.amazoncognito.com/oauth2/token \
| python -m json.tool
