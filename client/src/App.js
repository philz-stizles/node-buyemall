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

    const graphqlQuery = {
      query: `
        query {
          login(credentials: { 
            email: "${email}",  
            password: "${password}" 
          }){
            userId
            token
          }
        }`
    }

    this.setState({ authLoading: true })

    fetch('http://localhost:5000/graphql', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    })
      .then(response => response.json())
      .then(responseData => {
        console.log(responseData)
        if(responseData.errors && responseData.errors[0].status === 422) {
          throw new Error('Validation failed')
        } 
        
        if(responseData.errors) {
          throw new Error('User creation failed')
          // this.setState({ isAuthenticated: false, authLoading: false })
        }

        // Set state
        const token = responseData.data.login.token
        const userId = responseData.data.login.userId
        this.setState({ isAuthenticated: true, authLoading: false, token, userId })

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
      })
      .catch(error => {
        console.log(error)
        this.setState({ isAuthenticated: false, authLoading: false, error: error })
      })
  }

  handleSignup = (e, signupForm) => {
    e.preventDefault()
    const { email,  username, password } = signupForm
    const graphqlQuery = {
      query: `
        mutation {
          register(credentials: { 
            email: "${email.value}",  
            username: "${username.value}", 
            password: "${password.value}" 
          }){
            _id
            email
          }
        }`
    }
    
    this.setState({ authLoading: true })

    fetch('http://localhost:5000/graphql', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    })
      .then(response => response.json())
      .then(responseData => {
        console.log(responseData)
        if(responseData.errors && responseData.errors[0].status === 422) {
          throw new Error('Validation failed')
        } 
        
        if(responseData.errors) {
          throw new Error('User creation failed')
          // this.setState({ isAuthenticated: false, authLoading: false })
        }

        this.setState({ isAuthenticated: false, authLoading: false })
        this.props.history.replace('/')
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
