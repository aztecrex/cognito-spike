exports.handler = (event: any, context: any, callback: any) => {
    if (event.request.challengeName == 'CUSTOM_CHALLENGE') {
        // event.response.publicChallengeParameters = {};
        // // event.response.publicChallengeParameters.captchaUrl = 'url/123.jpg'
        // event.response.privateChallengeParameters = {};
        // event.response.privateChallengeParameters.answer = '5';
        // event.response.challengeMetadata = 'CAPTCHA_CHALLENGE';
        event.response.publicChallengeParameters = {
            question: "Do you authorize baz to look at your stuff?",
            // responses: ["yes", "no"]
        }
        event.response.privateChallengeParameters = { answer: "yes" };
        event.response.challengeMetadata = "BAZ_CHALLENGE";
    }
    console.log("create auth challenge");

    //Return to Amazon Cognito
    callback(null, event);
}
