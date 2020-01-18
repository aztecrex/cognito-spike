#!/bin/bash

AccessCode=""

curl -X GET -H "authorization: $AccessCode" https://gztyqmswbl.execute-api.us-east-1.amazonaws.com/prod/global-logout
