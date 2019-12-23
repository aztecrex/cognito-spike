import * as AWS from "aws-sdk"
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js";
import * as React from "react";
import * as ReactDOM from "react-dom";
import appConfig from "./config";

AWS.config.region = appConfig.region;
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: appConfig.IdentityPoolId
});

const userPool = new CognitoUserPool({
  UserPoolId: appConfig.UserPoolId,
  ClientId: appConfig.ClientId,
});

interface EPFormState {
  email: string
  password: string
}

interface EPFormProps {
  submit(s: EPFormState): void
}

class EPForm extends React.Component<EPFormProps, EPFormState> {
  constructor(props: EPFormProps) {
    super(props)
    this.state = {email: "", password: ""}

    this.handleEmailChange = this.handleEmailChange.bind(this)
    this.handlePasswordChange = this.handlePasswordChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
  }

  handleEmailChange(e: any) {
    this.setState({email: e.target.value});
  }

  handlePasswordChange(e: any) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e: any) {
    e.preventDefault()
    this.props.submit(this.state)
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text"
               value={this.state.email}
               placeholder="Email"
               onChange={this.handleEmailChange}/>
        <input type="password"
               value={this.state.password}
               placeholder="Password"
               onChange={this.handlePasswordChange}/>
        <input type="submit"/>
      </form>
    )
  }
}

const challenge = (clientId: string) => (s: EPFormState): void => {
  const email = s.email.trim();
  const password = s.password.trim();
  const userPool = new CognitoUserPool({
    UserPoolId: appConfig.UserPoolId,
    ClientId: clientId,
  });
  const authenticationData = { Username: email, Password: password }
  , authenticationDetails = new AuthenticationDetails(authenticationData)
  , cognitoUser = new CognitoUser({ Username: email, Pool: userPool })

  cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
  cognitoUser.initiateAuth(authenticationDetails, {
    onSuccess: function(result) {
      // User authentication was successful
      console.log('onSuccess', result);
      cognitoUser.updateAttributes(
        [{Name: "custom:baz", Value: "true"}],
        (err, data) => {
          if (err) console.log(err, err.stack)
          else console.log(data)
        })
    },
    onFailure: function(err) {
      // User authentication was not successful
      console.log('onFailure', err)
      alert("you declined to authorize baz")
    },
    customChallenge: function(challengeParameters) {
      console.log("challengeParameters", challengeParameters)
      // User authentication depends on challenge response
      const challengeResponse = confirm(challengeParameters.question) ? 'yes' : 'no'
      cognitoUser.sendCustomChallengeAnswer(challengeResponse, this);
    },
  });
}

const doLogin = (s: EPFormState): void => {
  const email = s.email.trim();
  const password = s.password.trim();
  const authenticationData = { Username: email, Password: password }
  , authenticationDetails = new AuthenticationDetails(authenticationData)
  , cognitoUser = new CognitoUser({ Username: email, Pool: userPool })

  cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH")
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      const accessToken = result.getAccessToken().getJwtToken()
      AWS.config.region = appConfig.region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: appConfig.IdentityPoolId,
        Logins: {
          ["cognito-idp."+ appConfig.region +".amazonaws.com/"+ appConfig.UserPoolId]:
            result.getIdToken().getJwtToken()
        }
      })
      console.log("result", result)
      console.log(window.location.search)
    },
    onFailure: function(err) {
      alert(err.message || JSON.stringify(err))
    },
  })
}

const doSignUp = (s: EPFormState): void => {
  const email = s.email.trim();
  const password = s.password.trim();
  const attributeList = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    })
  ];
  userPool.signUp(email, password, attributeList, [], (err, result) => {
    if (err) { console.log(err); return; }
    console.log('user name is ' + result!.user.getUsername());
    console.log('call result: ' + result);
  });
}

const CognitoSpikeForm = () => {
  return (
    <>
      <EPForm submit={doLogin}/> <br/>
      Sign Up
      <EPForm submit={doSignUp}/> <br/>
      CJ Challenge
      <EPForm submit={challenge(appConfig.ClientId)}/> <br/>
      3rd Party Challenge
      <EPForm submit={challenge(appConfig.foreignClient)}/>
    </>
  )
}

ReactDOM.render(<CognitoSpikeForm />, document.getElementById('app'))
