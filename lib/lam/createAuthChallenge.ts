import { CognitoUserPoolTriggerEvent } from "aws-lambda";


export const handler =
async (e: CognitoUserPoolTriggerEvent): Promise<CognitoUserPoolTriggerEvent> => {
  console.log(e)
    console.log("session", JSON.stringify(e.request.session));
  if (e.request.challengeName == 'CUSTOM_CHALLENGE') {
    // e.response.publicChallengeParameters = {};
    // // e.response.publicChallengeParameters.captchaUrl = 'url/123.jpg'
    // e.response.privateChallengeParameters = {};
    // e.response.privateChallengeParameters.answer = '5';
    // e.response.challengeMetadata = 'CAPTCHA_CHALLENGE';
    e.response.publicChallengeParameters = {
      client: "baz",
      source: "public"
    }
    e.response.privateChallengeParameters = { answer : 'yes'};
    e.response.challengeMetadata = "SCOPE";
  }
  console.log("create auth challenge");

  //Return to Amazon Cognito
  return e
}
