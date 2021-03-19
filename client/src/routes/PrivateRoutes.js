import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import PostPage from '../pages/Posts/Posts'
import PostDetailPage from '../pages/Posts/PostDetail/PostDetail'

const PrivateRoutes = ({userId, token}) => {
    return (
        <Switch>
            <Route path="/" exact render={props => <PostPage userCredentials={{ userId, token }} {...props} />} />
            <Route path="/:postId" render={props => <PostDetailPage userCredentials={{ userId, token }} {...props} />} />
            <Redirect to="/" />
        </Switch>
    )
}

export default PrivateRoutes
