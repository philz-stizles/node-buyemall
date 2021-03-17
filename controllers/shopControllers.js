const Product = require('../models/product')

exports.getIndexView = (req, res) => {
    console.log('here')
    Product.findAll(products => {
        console.log(products)
        res.render('shop/', { 
            pageTitle: 'Shop', 
            products, 
            path: '/',
            hasProducts: products.length > 0,
        })
    })
}

exports.getProductsView = (req, res) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', { 
                pageTitle: 'Shop', 
                products, 
                path: '/shop/products',
                isAuthenticated: req.session.isAuthenticated,
                hasProducts: products.length > 0 
            })
        })
        .catch(error => console.log(error))
    
}

exports.getProductDetailView = (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render('shop/product-details', { 
                pageTitle: 'Product Details', 
                product, 
                path: '/product-details',
                isAuthenticated: req.session.isAuthenticated,
                productExists: product !== null && product !== undefined 
            });
        })
        .catch(error => console.log(error))
}

exports.addToCart = (req, res) => {
    console.log(req.params.id)
    Product.findById(req.params.id)
        .then(product => {
            console.log(req.session)
            return req.user.addToCart(product)
        })
        .then(updatedUser => {
            console.log(updatedUser)
            res.redirect('/cart')
        })
        .catch(error => {
            console.log(error)
        })
}

exports.removeFromCart = (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            return req.user.removeFromCart(product)
        })
        .then(updatedUser => {
            console.log(updatedUser)
            res.redirect('/cart')
        })
        .catch(error => {
            console.log(error)
        })
}

exports.getCartView = (req, res) => {
    req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
            console.log(user.cart.items)
            res.render('shop/cart', { 
                pageTitle: 'Your Cart',  
                path: '/cart',
                products: user.cart.items,
                isAuthenticated: req.session.isAuthenticated
            });
        })
        .catch(error => {
            console.log(error)
        })
}

exports.getCheckoutView = (req, res) => {
    res.render('shop/checkout', { 
        pageTitle: 'Checkout', 

        path: '/checkout'
    });
}

exports.getOrdersView = (req, res) => {
    
}

exports.createOrder = (req, res) => {
    
}