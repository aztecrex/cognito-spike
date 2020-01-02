exports.handler = (event: any, context: any, callback: any) => {
    console.log("define auth challenge")
    console.log("event", JSON.stringify(event))
    console.log("context", JSON.stringify(context));
    if( event.callerContext.clientId == "269opr68vm5lud18faf7vi8rv6" || event.request.userAttributes["custom:baz"] == "true"){
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    } else{
        if (event.request.session.length >= 1 && event.request.session[0].challengeResult == true  )
            event.response.issueTokens = true
        else if (event.request.session.length >= 1 && event.request.session[0].challengeResult == false) {
            event.response.failAuthentication = true
        } else {
        // if (event.request.session.length == 1 && event.request.session[0].challengeName == 'CUSTOM_CHALLENGE') {
            event.response.challengeName = 'CUSTOM_CHALLENGE';
            event.response.issueTokens = false;
            event.response.failAuthentication = false;
        // } else {
        //     event.response.issueTokens = false;
        //     event.response.failAuthentication = true;
        }
    }



    // Return to Amazon Cognito
    callback(null, event);
}

// exports.handler = (event, context, callback) => {
//     console.log("foo")
//     if (event.request.session.length == 1 && event.request.session[0].challengeName == 'SRP_A') {
//         event.response.issueTokens = false;
//         event.response.failAuthentication = false;
//         event.response.challengeName = 'PASSWORD_VERIFIER';
//     } else if (event.request.session.length == 2 && event.request.session[1].challengeName == 'PASSWORD_VERIFIER' && event.request.session[1].challengeResult == true) {
//         event.response.issueTokens = false;
//         event.response.failAuthentication = false;
//         event.response.challengeName = 'CUSTOM_CHALLENGE';
//     } else if (event.request.session.length == 3 && event.request.session[2].challengeName == 'CUSTOM_CHALLENGE' && event.request.session[2].challengeResult == true) {
//         event.response.issueTokens = true;
//         event.response.failAuthentication = false;
//     } else {
//         event.response.issueTokens = false;
//         event.response.failAuthentication = true;
//     }

//     // Return to Amazon Cognito
//     callback(null, event);
// }
