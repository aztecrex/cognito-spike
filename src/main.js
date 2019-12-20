import {Config, CognitoIdentityCredentials} from "aws-sdk";
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js";
import React from "react";
import ReactDOM from "react-dom";
import appConfig from "./config";

Config.region = appConfig.region;
Config.credentials = new CognitoIdentityCredentials({
  IdentityPoolId: appConfig.IdentityPoolId
});

const userPool = new CognitoUserPool({
  UserPoolId: appConfig.UserPoolId,
  ClientId: appConfig.ClientId,
});

class ChallengeForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
    const userPool = new CognitoUserPool({
      UserPoolId: appConfig.UserPoolId,
      ClientId: this.props.clientId,
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
        // var params = {
        //   UserAttributes: [ /* required */
        //     {
        //       Name: 'baz', /* required */
        //       Value: 'true'
        //     },
        //     /* more items */
        //   ],        
        // };
        cognitoUser.updateAttributes([{Name: "custom:baz", Value: "true"}], function(err, data) {
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
        let challengeResponses
        if (confirm(challengeParameters.question))
          challengeResponses = 'yes';
        else challengeResponses = 'no'
        cognitoUser.sendCustomChallengeAnswer(challengeResponses, this);
      },
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <input type="text"
                 value={this.state.email}
                 placeholder="Email"
                 onChange={this.handleEmailChange.bind(this)}/>
          <input type="password"
                 value={this.state.password}
                 placeholder="Password"
                 onChange={this.handlePasswordChange.bind(this)}/>
          <input type="submit"/>
        </form>
      </div>
    );
  }

}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
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

  render() {
    return (
      <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input type="text"
               value={this.state.email}
               placeholder="Email"
               onChange={this.handleEmailChange.bind(this)}/>
        <input type="password"
               value={this.state.password}
               placeholder="Password"
               onChange={this.handlePasswordChange.bind(this)}/>
        <input type="submit"/>
      </form> <br/>
      Sign Up
        <SignUpForm/>
        <br/>
        cj Challenge
        <ChallengeForm clientId="269opr68vm5lud18faf7vi8rv6"/>
        <br/>
        third party Challenge
        <ChallengeForm clientId="37fnmm2dop67vade1i372v1si3"/>
      </div>
  );
  }
}

class SignUpForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
    };
  }

  handleEmailChange(e) {
    this.setState({email: e.target.value});
  }

  handlePasswordChange(e) {
    this.setState({password: e.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    const email = this.state.email.trim();
    const password = this.state.password.trim();
    const attributeList = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: email,
      })
    ];
    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log('user name is ' + result.user.getUsername());
      console.log('call result: ' + result);
    });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit.bind(this)}>
        <input type="text"
               value={this.state.email}
               placeholder="Email"
               onChange={this.handleEmailChange.bind(this)}/>
        <input type="password"
               value={this.state.password}
               placeholder="Password"
               onChange={this.handlePasswordChange.bind(this)}/>
        <input type="submit"/>
      </form>
    );
  }
}

ReactDOM.render(<LoginForm />, document.getElementById('app'));

