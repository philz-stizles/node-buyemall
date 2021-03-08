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

  setAutoLogout = (expresIn) => {
    setTimeout(() => this.handleLogout(), expresIn)
  }

  handleLogin = (e, { email, password }) => {
    e.preventDefault()
    this.setState({ authLoading: true })

    const graphqlQuery = {
      query: `
        query {
          login(credentials: { email: "${email}", password: "${password}" }) {
            userId
            token
          }
        }
      `
    }

    fetch('http://localhost:5000/graphql', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    })
      .then(response => response.json())
      .then(responseData => {
        console.log(responseData)
        if(responseData.errors) {
          
        }

        // Set state
        const token = responseData.data.login.token
        const userId = responseData.data.login.userId
        this.setState({ 
          isAuthenticated: true, 
          authLoading: false,
          token,
          userId
        })

        // Store credentials in localstorage
        const userCredentials = { token, userId }
        localStorage.setItem('Buyemall', JSON.stringify(userCredentials))
      })
      .catch(error => {
        console.log(error)
        this.setState({ isAuthenticated: false, authLoading: false, error: error })
      })
  }

  handleSignup = (e, { signupForm }) => {
    const { username, email, password } = signupForm
    e.preventDefault()
    this.setState({ authLoading: true })

    const graphqlQuery = {
      query: `
        mutation {
          createUser(user: { username: "${username.value}", email: "${email.value}", password: "${password.value}" }) {
            _id
            email
          }
        }
      `
    }

    fetch('http://localhost:5000/graphql', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(graphqlQuery)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        if(data.errors) {
          
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

    const { token, expiresIn } = JSON.parse(userCredentialsJSON)

    // if(!token || !expiresIn) {
    if(!token) {
      return
    }

    // const expresInDate = new Date(expiresIn)
    // if( expresInDate <= new Date()) {
    //   this.handleLogout()
    //   return
    // }

    // const remainingMilliseconds = expresInDate.getTime() - new Date().getTime()
    // localStorage.setItem('expiresIn', remainingMilliseconds)
    this.setState({ isAuthenticated: true, token })
    // this.setAutoLogout(remainingMilliseconds)
  }

  render() {
    const { isAuthenticated, authLoading, userId, token, showMobileNav, showBackdrop } = this.state
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
