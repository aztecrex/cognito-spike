#!/usr/bin/env zsh

aws lambda update-function-code \
    --function-name arn:aws:lambda:us-east-1:114272735376:function:cognitospike2cognitoserverservl-entryPoint50658EA3-1DIF44NQ50GB2 \
    --zip-file fileb://dist/lam/entryPoint-bundle.zip

aws lambda update-function-code \
    --function-name arn:aws:lambda:us-east-1:114272735376:function:cognitospike2pool2B518337-triggerdefineAuthChallen-1W47AQQB7ENF2 \
    --zip-file fileb://dist/lam/defineAuthChallenge-bundle.zip

aws lambda update-function-code \
    --function-name arn:aws:lambda:us-east-1:114272735376:function:cognitospike2pool2B518337-triggercreateAuthChallen-1PSPXDRYPKXRH \
    --zip-file fileb://dist/lam/createAuthChallenge-bundle.zip

aws lambda update-function-code \
    --function-name arn:aws:lambda:us-east-1:114272735376:function:cognitospike2pool2B518337-triggerverifyAuthChallen-1E9A1UGVLXZHL \
    --zip-file fileb://dist/lam/verifyAuthChallengeResponse-bundle.zip
