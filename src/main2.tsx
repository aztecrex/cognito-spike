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

interface LoginFormState {
  email: string
  password: string
}

class EPForm extends React.Component
  <{submit(e:any, s:LoginFormState, c?:string):void}, LoginFormState> {
  constructor(props: {submit(e:any, s: LoginFormState):void}) {
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
    this.props.submit(e, this.state)
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

const CognitoSpikeForm = () => {
  return (
    <div>
      <EPForm submit={doLogin}/> <br/>
      Sign Up
      <EPForm submit={doSignUp}/> <br/>
      CJ Challenge
      <EPForm submit={challenge("269opr68vm5lud18faf7vi8rv6")}/> <br/>
      3rd Party Challenge
      <EPForm submit={challenge("37fnmm2dop67vade1i372v1si3")}/>
    </div>
  )
}

function challenge(clientId: string) {
  return function(e: any, s: LoginFormState) {
    e.preventDefault();
    const email = s.email.trim();
    const password = s.password.trim();
    const userPool = new CognitoUserPool({
      UserPoolId: appConfig.UserPoolId,
      ClientId: clientId,
    });
    const authenticationData = { Username: email, Password: password }
    , authenticationDetails = new AuthenticationDetails(authenticationData)
    , cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      })

    cognitoUser.setAuthenticationFlowType('CUSTOM_AUTH');
    cognitoUser.initiateAuth(authenticationDetails, {
      onSuccess: function(result) {
        // User authentication was successful
        console.log('onSuccess', result);
        cognitoUser.updateAttributes(
          [{Name: "custom:baz", Value: "true"}],
          (err, data) => {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
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
}

function doLogin(e: any, s: LoginFormState) {
  e.preventDefault();
  const email = s.email.trim();
  const password = s.password.trim();
  const authenticationData = { Username: email, Password: password }
  , authenticationDetails = new AuthenticationDetails(authenticationData)
  , cognitoUser = new CognitoUser(
    { Username: email
    , Pool: userPool
    })

  cognitoUser.setAuthenticationFlowType("CUSTOM_AUTH")
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      const accessToken = result.getAccessToken().getJwtToken()
      AWS.config.region = "us-east-1"
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-1:3d2383b5-9c5c-4a6a-be5d-8c095d2ea9a3',
        Logins: {
          "cognito-idp.us-east-1.amazonaws.com/us-east-1_e60XYXrIE":
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

function doSignUp(e: any, s: LoginFormState) {
  e.preventDefault();
  const email = s.email.trim();
  const password = s.password.trim();
  const attributeList = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    })
  ];
  userPool.signUp(email, password, attributeList, [], (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('user name is ' + result!.user.getUsername());
    console.log('call result: ' + result);
  });
}

ReactDOM.render(<CognitoSpikeForm />, document.getElementById('app'));
