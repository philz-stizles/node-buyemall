const { validationResult } = require('express-validator')
const Product = require('../models/product')

exports.getCreateProductView = (req, res) => {
    res.render('admin/create-product', { 
        pageTitle: 'Create Product', 
        path: '/admin/createProduct'
    });
}

exports.createProduct = (req, res) => {
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/create-product', {
            path: '/admin/create-product',
            pageTitle: 'Create Product',
            errorMessage: errors.array()[0].msg
        })
    }

    const { title, description, price, imageURL } = req.body;
    const newProduct = new Product({ title, description, price, imageURL, creator: req.user })
    newProduct.save((product, error) => {
        if(error) {
            console.log(error)
            return res.redirect('/admin/create-product')
        }
        res.redirect('/admin/products')
    })
}

exports.getProductsView = (req, res) => {
    Product.find()
        .then(products => {
            res.render('admin/products', { 
                pageTitle: 'View Products', 
                products, 
                path: '/admin/products',
                hasProducts: products.length > 0 
            });
        })
        .catch(error => console.log(error))
    
}

exports.getProductDetailView = (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render('admin/products', { 
                pageTitle: 'View Products', 
                product, 
                path: '/admin/products',
                hasProducts: products.length > 0 
            });
        })
        .catch(error => console.log(error))
}

exports.getProductUpdateView = (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render('admin/update-product', { 
                pageTitle: 'View Products', 
                product, 
                path: '/admin/update-product',
                productExists: product !== null && product !== undefined 
            });
        })
        .catch(error => console.log(error))
}

exports.updateProduct = (req, res) => {
    const { title, description, price, imageURL} = req.body
    Product.findById(req.params.id)
        .then(product => {
            product.title = title
            product.description = description
            product.price = price
            product.imageURL = imageURL

            return product.save()
        })
        .then(updatedProduct => {
            res.redirect('/admin/products')
        })
        .catch(error => {
            console.log(error)
            res.redirect(`/admin/updated-product/${req.params.id}`)
        })
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

exports.deleteProduct = (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then(() => {
            res.redirect('/admin/products')
        })
        .catch(error => console.log(error))

    
}