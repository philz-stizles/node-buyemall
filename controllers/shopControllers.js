const Product = require('../models/product')

exports.getProductList = (req, res) => {
    const products = Product.fetchAll();
    res.render('shop/product-list', { 
        pageTitle: 'Shop', 
        products, 
        path: '/',
        hasProducts: products.length > 0 
    })
}

exports.getProductDetails = (req, res) => {
    const id = req.params.id;
    const product = Product.fetchById(id);
    res.render('shop/product-details', { 
        pageTitle: 'Product Details', 
        product, 
        path: '/shop/productDetails',
        productExists: product !== null && product !== undefined 
    });
}

exports.getCart = (req, res) => {
    
}

exports.getCheckout = (req, res) => {
    
}

exports.getOrders = (req, res) => {
    
}