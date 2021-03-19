const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    const authorizationHeader = req.get('Authorization');
    if (!authorizationHeader) {
        req.isAuth = false;
        return next();
    }

    const token = authorizationHeader.split(' ')[1];

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_AUTH_SECRET);
    } catch (err) {
        req.isAuth = false;
        return next();
    }

    if (!decodedToken) {
        req.isAuth = false;
        return next();
    }

    req.userId = decodedToken.userId;
    req.isAuth = true; // BEWARE!!!!. another field name isAuthenticated is set on req

    next();
}