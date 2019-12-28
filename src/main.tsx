import * as AWS from "aws-sdk"
import {
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
  CognitoUser
} from "amazon-cognito-identity-js"
import * as React from "react"
import * as ReactDOM from "react-dom"
import { Route, Switch } from 'react-router-dom'
import appConfig from "./config"
import { createBrowserHistory } from 'history'
import { Router } from "react-router"
export const history = createBrowserHistory()

AWS.config.region = appConfig.region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: appConfig.IdentityPoolId
})

const userPool = new CognitoUserPool({
  UserPoolId: appConfig.UserPoolId,
  ClientId: appConfig.ClientId
})

interface EPFormState {
  email: string
  password: string
}

interface EPFormProps {
  submit(s: EPFormState): void
}

interface LoginEndpointProps {
  clientId: string
  redirectUri: string
  responseType: string
  state?: string
  scope?: string
}

class LoginEndpoint extends React.Component
  <LoginEndpointProps, {isLoggedIn: boolean, email: string}> {

  readonly userPool: CognitoUserPool
  readonly cognitoUser: CognitoUser | null

  constructor(props: LoginEndpointProps) {
    super(props)
    console.log(props)
    this.userPool = new CognitoUserPool({
      UserPoolId: appConfig.UserPoolId,
      ClientId: appConfig.ClientId
    })

    this.cognitoUser = this.userPool.getCurrentUser()
    this.cognitoUser?.getUserAttributes((err, xs) => {
      console.log(xs)
    })

    this.state = { isLoggedIn: this.cognitoUser != null, email: "ffff" }
  }

  render() {
    return this.state.isLoggedIn
      ? <SignInAsForm email={this.cognitoUser!.getUsername()} />
      : <EPForm submit={doLogin(this.props.redirectUri)} />
  }
}

const LoginEndpointParser = () => {
  const x = new URL(document.location.href).searchParams
  , p =
    { clientId: x.get("client_id") || ""
    , redirectUri: x.get("redirect_uri") || ""
    , responseType: x.get("response_type") || ""
    , state: x.get("state") || undefined
    , scope: x.get("scope") || undefined
    }

  if (p.clientId == "" || p.redirectUri == "" || p.responseType == "")
    console.error("bad request", x)

  return <LoginEndpoint {...p}/>
}

const LogoutEndpoint = (props: {}) => {
  userPool.getCurrentUser()?.signOut()
  const logoutUri = new URL(document.location.href)
    .searchParams.get("logout_uri") || undefined
  if (logoutUri) window.location.href = logoutUri

  return <></>
}

class SignInAsForm extends React.Component<{email: string}, {}> {
  constructor(props: {email: string}) {
    super(props)

    this.currentUser = this.currentUser.bind(this)
    this.differentUser = this.differentUser.bind(this)
  }

  currentUser() {
    window.location.href = (new URL(document.location.href))
      .searchParams.get("redirect_uri") || ""
  }

  differentUser() {
    userPool.getCurrentUser()?.signOut()
    window.location.reload()
  }

  render() {
    return <>
      <button onClick={this.currentUser}>Sign in as {this.props.email}</button> <br/>
      <button onClick={this.differentUser}>Sign in as a different user?</button>
    </>
  }
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
    this.setState({email: e.target.value})
  }

  handlePasswordChange(e: any) {
    this.setState({password: e.target.value})
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
  const email = s.email.trim()
  , password = s.password.trim()
  , userPool = new CognitoUserPool({
    UserPoolId: appConfig.UserPoolId,
    ClientId: clientId,
  })
  , authenticationData = { Username: email, Password: password }
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
      console.log(err.message || JSON.stringify(err))
      alert("you declined to authorize baz")
    },
    customChallenge: function(challengeParameters) {
      console.log("challengeParameters", challengeParameters)
      // User authentication depends on challenge response
      const challengeResponse = confirm(challengeParameters.question)
        ? 'yes' : 'no'
      cognitoUser.sendCustomChallengeAnswer(challengeResponse, this);
    },
  });
}

const doLogin = (redirectUri?: string) => (s: EPFormState): void => {
  const email = s.email.trim()
  , password = s.password.trim()
  , authenticationData = { Username: email, Password: password }
  , authenticationDetails = new AuthenticationDetails(authenticationData)
  , cognitoUser = new CognitoUser({ Username: email, Pool: userPool })

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function(result) {
      const accessToken = result.getAccessToken().getJwtToken()
      AWS.config.region = appConfig.region
      AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: appConfig.IdentityPoolId,
        Logins: {
          ["cognito-idp."+ appConfig.region +".amazonaws.com/"
            + appConfig.UserPoolId]:
            result.getIdToken().getJwtToken()
        }
      })
      console.log("result", result)
      if (redirectUri) window.location.href = redirectUri
    },
    onFailure: function(err) {
      console.log(err)
    },
  })
}

const doSignUp = (s: EPFormState): void => {
  const email = s.email.trim()
  , password = s.password.trim()
  , attributeList = [
    new CognitoUserAttribute({
      Name: 'email',
      Value: email,
    })
  ]
  userPool.signUp(email, password, attributeList, [], (err, result) => {
    if (err) { console.log(err.message || JSON.stringify(err)); return; }
    console.log('user name is ' + result!.user.getUsername())
    console.log('call result: ' + result)
  })
}

export const CognitoSpikeForm = () => {
  return (
    <>
      <EPForm submit={doLogin()}/> <br/>
      Sign Up
      <EPForm submit={doSignUp}/> <br/>
      CJ Challenge
      <EPForm submit={challenge(appConfig.ClientId)}/> <br/>
      3rd Party Challenge
      <EPForm submit={challenge(appConfig.foreignClient)}/>
    </>
  )
}

interface AuthorizationEndpointProps {
  responseType: string
  clientId: string
  redirectUri: string
  state?: string
  identityProvider?: string
  idpIdentifier?: string
  scope?: string
  codeChallengeMethod?: string
  codeChallenge?: string
}

const AuthorizationEndpointParser = () => {
  const x = new URL(document.location.href).searchParams
  , p =
    { responseType: x.get("response_type") || ""
    , clientId: x.get("client_id") || ""
    , redirectUri: x.get("redirect_uri") || ""
    , state: x.get("state") || undefined
    , identityProvider: x.get("identity_provider") || undefined
    , idpIdentifier: x.get("idp_identifier") || undefined
    , scope: x.get("scope") || undefined
    , codeChallengeMethod: x.get("code_challenge_method") || undefined
    , codeChallenge: x.get("code_challenge") || undefined
    }

  if (p.responseType == "" || p.clientId == "" || p.redirectUri == "")
    console.error("bad request", x)

  return <AuthorizationEndpoint {...p} />
}

const AuthorizationEndpoint = (props: AuthorizationEndpointProps) => {
  const cisp = new AWS.CognitoIdentityServiceProvider()

  return <></>
}

const AuthUI = () => {
  return (
    <Switch>
      <Route path='/login'>
        <LoginEndpointParser />
      </Route>
      <Route path="/logout">
        <LogoutEndpoint />
      </Route>
      <Route path="/oauth2/authorize">
        <AuthorizationEndpointParser/>
      </Route>
      <Route path="/">
        <CognitoSpikeForm/>
      </Route>
    </Switch>
  )
}

ReactDOM.render(<Router history={history}><AuthUI /></Router>,
  document.getElementById('app'))
