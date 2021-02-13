const Product = require('./../models/product')

exports.getCreateProduct = (req, res) => {
    res.render('admin/create-product', { 
        pageTitle: 'Create Product', 
        activeCreateProduct: true,
        createProductCSS: true,
    });
}

exports.postCreateProduct = (req, res) => {
    const { title } = req.body;
    const newProduct = new Product(title, description, price)
    newProduct.save()
    res.redirect('/')
}

exports.getProduct = (req, res) => {
    
}

exports.getAllProducts = (req, res) => {
    const products = Product.fetchAll();
    res.render('shop', { 
        pageTitle: 'Shop', 
        products, 
        activeShop: true, 
        shopCSS: true,
        hasProducts: products.length > 0 
    })
}

exports.updateProduct = (req, res) => {

}

exports.deleteProduct = (req, res) => {

}