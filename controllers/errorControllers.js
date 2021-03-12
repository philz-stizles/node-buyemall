exports.send404 = (req, res, next) => {
    res.status(404).render('404', { pageTitle: '404', path: '/404', isAuthenticated: req.session.isAuthenticated })
}