import { CognitoUserPoolTriggerEvent } from "aws-lambda"

export const handler =
async (event: CognitoUserPoolTriggerEvent): Promise<CognitoUserPoolTriggerEvent> => {
  console.log("event", event);
  console.log("session", JSON.stringify(event.request.session));

    // @ts-ignore
    if (event.request.session!.length == 1 && event.request.session[0].challengeName == 'SRP_A') {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'PASSWORD_VERIFIER';
    } else if (event.request.session!.length == 2 && event.request.session![1].challengeName == 'PASSWORD_VERIFIER' && event.request.session![1].challengeResult == true) {
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = 'CUSTOM_CHALLENGE';
    } else if (event.request.session!.length == 3 && event.request.session![2].challengeName == 'CUSTOM_CHALLENGE' && event.request.session![2].challengeResult == true) {
       console.log("issuing tokens")
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    } else {
        console.log("failing login")
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    }

  return event
}
