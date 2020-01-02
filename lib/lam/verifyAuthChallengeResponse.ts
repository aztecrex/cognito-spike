exports.handler = (event: any, context: any, callback: any) => {
    console.log("challenge parameters answer", event.request.privateChallengeParameters.answer)
    console.log("challenge answer", event.request.challengeAnswer)
    if (event.request.privateChallengeParameters.answer == event.request.challengeAnswer) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    // Return to Amazon Cognito
    callback(null, event);
}
