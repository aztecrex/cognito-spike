import { CognitoUserPoolTriggerEvent } from "aws-lambda"

export const handler =
async (e: CognitoUserPoolTriggerEvent): Promise<CognitoUserPoolTriggerEvent> => {
  console.log("event", e)

  // // @ts-ignore
  // if (event.request.session!.length == 1 && event.request.session![0].challengeName == 'SRP_A') {
  //   event.response.issueTokens = false;
  //   event.response.failAuthentication = false;
  //   event.response.challengeName = 'PASSWORD_VERIFIER';
  // } else if (event.request.session!.length == 2 && event.request.session![1].challengeName == 'PASSWORD_VERIFIER' && event.request.session![1].challengeResult == true) {
  //   event.response.issueTokens = false;
  //   event.response.failAuthentication = false;
  //   event.response.challengeName = 'CUSTOM_CHALLENGE';
  // } else if (event.request.session!.length == 3 && event.request.session![2].challengeName == 'CUSTOM_CHALLENGE' && event.request.session![2].challengeResult == true) {
  //   event.response.issueTokens = true;
  //   event.response.failAuthentication = false;
  // } else {
  //   event.response.issueTokens = false;
  //   event.response.failAuthentication = true;
  // }

  if (e.request.session!.length == 0
    // && e.request.session![0].challengeName == 'PASSWORD_VERIFIER'
    // && e.request.session![0].challengeResult == true
    ) {
    console.log("sending password_verifier challenge name")
    e.response.issueTokens = false;
    e.response.failAuthentication = false;
    e.response.challengeName = 'PASSWORD_VERIFIER';
  } else if (e.request.session!.length == 2
    && e.request.session![1].challengeName == 'CUSTOM_CHALLENGE'
    && e.request.session![1].challengeResult == true) {
    e.response.issueTokens = true;
    e.response.failAuthentication = false;
  } else {
    console.log("failing auth")
    e.response.issueTokens = false;
    e.response.failAuthentication = true;
  }

  return e
}
