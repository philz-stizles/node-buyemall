import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import PostPage from '../pages/Feed/Posts'
import FeedDetailPage from '../pages/Feed/FeedDetail/FeedDetail'

const PrivateRoutes = ({userId, token}) => {
    return (
        <Switch>
            <Route path="/" exact render={props => <PostPage userCredentials={{ userId, token }} {...props} />} />
            <Route path="/:postId" render={props => <FeedDetailPage userCredentials={{ userId, token }} {...props} />} />
            <Redirect to="/" />
        </Switch>
    )
}

export default PrivateRoutes
