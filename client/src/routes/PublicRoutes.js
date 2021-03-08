import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import LoginPage from '../pages/Auth/Login'
import SignupPage from '../pages/Auth/Signup'

const PublicRoutes = ({ loading, onLogin, onSignup }) => {
    return (
        <Switch>
            <Route path="/" exact render={props => <LoginPage {...props} loading={loading} onLogin={onLogin} />} />
            <Route path="/signup" exact render={props => <SignupPage {...props} loading={loading} onSignup={onSignup} />} />
            <Redirect to="/" />
        </Switch>
    )
}

export default PublicRoutes
