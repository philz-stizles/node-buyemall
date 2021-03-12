exports.authenticate = (req, res, next) => {
    if(!req.session.isAuthenticated) {
        return res.redirect('/auth/login')
    }

    next()
} 