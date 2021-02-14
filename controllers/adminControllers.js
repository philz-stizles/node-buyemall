const Product = require('../models/product')

exports.getCreateProduct = (req, res) => {
    res.render('admin/create-product', { 
        pageTitle: 'Create Product', 
        path: '/admin/createProduct'
    });
}

exports.getViewProducts = (req, res) => {
    const products = Product.fetchAll();
    res.render('admin/view-products', { 
        pageTitle: 'View Products', 
        products, 
        path: '/admin/viewProducts',
        hasProducts: products.length > 0 
    });
}

exports.postCreateProduct = (req, res) => {
    const { title, description, price } = req.body;
    const newProduct = new Product(title, description, price)
    newProduct.save()
    res.redirect('/')
}

exports.getProduct = (req, res) => {
    
}

exports.getAllProducts = (req, res) => {
    const products = Product.fetchAll();
    res.render('shop/product-list', { 
        pageTitle: 'Shop', 
        products, 
        path: '/',
        hasProducts: products.length > 0 
    })
}

exports.updateProduct = (req, res) => {

}

exports.deleteProduct = (req, res) => {
    Product.removeById(req.params.id)
    res.redirect('/admin/viewProducts')
}