import { Component, Fragment } from 'react';
import { withRouter } from 'react-router-dom'
import PrivateRoutes from './routes/PrivateRoutes';
import PublicRoutes from './routes/PublicRoutes';
import './App.css';
import Layout from './components/Layout/Layout';
import MainNavigation from './components/Navigation/MainNavigation/MainNavigation';
import MobileNavigation from './components/Navigation/MobileNavigation/MobileNavigation';
import Toolbar from './components/Toolbar/Toolbar';
class App extends Component{
  state = {
    showBackdrop: false,
    showMobileNav: false,
    isAuthenticated: false,
    token: null,
    loggedInUser: null,
    authLoading: false,
    error: null
  }

  handleBackdropClick = () => {
    this.setState({ showBackdrop: false, showMobileNav: false, error: null })
  }

  handleMobileNavToggle = (isOpen) => {
    this.setState({ showBackdrop: isOpen, showMobileNav: isOpen })
  }

  handleLogout = () => {
    this.setState({  isAuthenticated: false, token: null, loggedInUser: null })
    localStorage.removeItem('Buyemall')
  }

  setAutoLogout = (expiresIn) => {
    setTimeout(() => this.handleLogout(), expiresIn)
  }

  handleLogin = (e, { email, password }) => {
    e.preventDefault()
    this.setState({ authLoading: true })

    fetch('http://localhost:5000/api/v1/auth/login', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if(data.status === true) {
          // Set state
          const token = data.data.token
          const userId = data.data.loggedInUser.id
          this.setState({ 
            isAuthenticated: true, 
            authLoading: false,
            token,
            userId
          })


          // Configure token expiration time -> 30mins
          const remainingSeconds = 60 * 30 
          const remainingMilliseconds = remainingSeconds * 1000;
          const expiresIn = new Date(
            new Date().getTime() + remainingMilliseconds
          ).toISOString();
    
          // Store credentials in localstorage
          const userCredentials = { token, userId, expiresIn }
          localStorage.setItem('Buyemall', JSON.stringify(userCredentials))
          this.setAutoLogout(remainingMilliseconds);
        } else {
          this.setState({ isAuthenticated: false, authLoading: false })
        }
      })
      .catch(error => {
        console.log(error)
        this.setState({ isAuthenticated: false, authLoading: false, error: error })
      })
  }

  handleSignup = (e, signupForm) => {
    e.preventDefault()
    console.log(signupForm)
    const { username, email, password } = signupForm
    
    this.setState({ authLoading: true })

    fetch('http://localhost:5000/api/v1/auth/signup', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if(data.status === true) {
          this.setState({ isAuthenticated: false, authLoading: false })
          this.props.history.replace('/')
        } else {
          this.setState({ isAuthenticated: false, authLoading: false })
        }
      })
      .catch(error => {
        console.log(error)
        this.setState({ isAuthenticated: false, authLoading: false })
      })
  }

  componentDidMount() {
    const userCredentialsJSON = localStorage.getItem('Buyemall')
    if(!userCredentialsJSON) {
      return
    }

    const userCredentials = JSON.parse(userCredentialsJSON)

    // if(!token || !expiresIn) {
    if(!userCredentials.token) {
      return
    }

    const expresInDate = new Date(userCredentials.expiresIn)
    if( expresInDate <= new Date()) {
      this.handleLogout()
      return
    }

    const remainingMilliseconds = expresInDate.getTime() - new Date().getTime()
    this.setState({ isAuthenticated: true, token: userCredentials.token })
    this.setAutoLogout(remainingMilliseconds)
  }

  render() {
    const { isAuthenticated, authLoading, userId, token, showMobileNav } = this.state
    let routes = <PublicRoutes loading={authLoading} onLogin={this.handleLogin} onSignup={this.handleSignup} />

    if (isAuthenticated) {
      routes = <PrivateRoutes userId={userId} token={token} />
    }

    return (
      <Fragment>
        <Layout
          header={
            <Toolbar>
              <MainNavigation
                onOpenMobileNav={this.handleMobileNavToggle.bind(this, true)}
                onLogout={this.handleLogout}
                isAuthenticated={isAuthenticated}
              />
            </Toolbar>
          }
          mobileNav={
            <MobileNavigation
              open={showMobileNav}
              mobile
              onChooseItem={this.handleMobileNavToggle.bind(this, false)}
              onLogout={this.logoutHandler}
              isAuth={isAuthenticated}
            />
          }
        />
        {routes}
      </Fragment>
    );
  }
}

export default withRouter(App)
