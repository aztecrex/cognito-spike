import { CognitoUserPoolTriggerEvent } from "aws-lambda"

export const handler =
async (e: CognitoUserPoolTriggerEvent): Promise<CognitoUserPoolTriggerEvent> => {
  console.log("event", e)

  if (e.request.session!.length == 0
    // && e.request.session![0].challengeName == 'PASSWORD_VERIFIER'
    // && e.request.session![0].challengeResult == true
    ) {
    console.log("sending password_verifier challenge name")
    e.response.issueTokens = false;
    e.response.failAuthentication = false;
    e.response.challengeName = "ADMIN_NO_SRP_AUTH";
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
