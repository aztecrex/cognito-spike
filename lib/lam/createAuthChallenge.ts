exports.handler = (event: any, context: any, callback: any) => {
    if (event.request.challengeName == 'CUSTOM_CHALLENGE') {
        // event.response.publicChallengeParameters = {};
        // // event.response.publicChallengeParameters.captchaUrl = 'url/123.jpg'
        // event.response.privateChallengeParameters = {};
        // event.response.privateChallengeParameters.answer = '5';
        // event.response.challengeMetadata = 'CAPTCHA_CHALLENGE';
        event.response.publicChallengeParameters = {
            client: "baz",
            source: "public"
        }
        event.response.privateChallengeParameters = {
            client: "baz",
            source: "private"
        }
        event.response.challengeMetadata = "SCOPE";
    }
    console.log("create auth challenge");

    //Return to Amazon Cognito
    callback(null, event);
}
