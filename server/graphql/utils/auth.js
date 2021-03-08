const jwt = require('jsonwebtoken')
const User = require('../../models/User')

exports.graphqlAuth = async (req, res, next) => {
    // Check if Authorization header exists
    const authHeader = req.get('Authorization')
    if(!authHeader) {
        req.isAuthenticated = false
        return next()
    }

    // Verify token
    const token = authHeader.split(' ')[1]
    let decodedToken

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        req.isAuthenticated = false
        return next()
    }

    if(!decodedToken) {
        req.isAuthenticated = false
        return next()
    }

    req.isAuthenticated = true
    req.userId = decodedToken.userId
    return next()
}