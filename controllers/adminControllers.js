const { validationResult } = require('express-validator')
const Product = require('../models/product');
const { deletFile } = require('../utils/fileUtil');

exports.getCreateProductView = (req, res) => {
    res.render('admin/create-product', { 
        pageTitle: 'Create Product', 
        path: '/admin/createProduct',
        oldInput: { title: '', description: '', price: '' },
        errorMessage: null,
        validationErrors: []
    });
}

exports.createProduct = (req, res) => {
    const { title, description, price, image } = req.body;
    const file = req.file;
    if(!file) {
        return res.status(422).render('admin/create-product', {
            path: '/admin/create-product',
            pageTitle: 'Create Product',
            oldInput: { title, description, price },
            errorMessage: 'Attached file is not an image',
            validationErrors: []
        })
    }

    
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/create-product', {
            path: '/admin/create-product',
            pageTitle: 'Create Product',
            oldInput: { title, description, price },
            errorMessage: errors.array()[0].msg
        })
    }

    const newProduct = new Product({ title, description, price, creator: req.user, imageURL: file.path })
    newProduct.save()
        .then(newProduct => {
            res.redirect('/admin/products')
        })
        .catch(error => {
            console.log(error)
            // return res.status(500).render('admin/create-product', {
            //     path: '/admin/create-product',
            //     pageTitle: 'Create Product',
            //     oldInput: { title, description, price },
            //     errorMessage: 'Database operation failed, please try again'
            // })
            // res.redirect('/500')
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.getProductsView = (req, res) => {
    Product.find({ creator: req.user._id })
        .then(products => {
            res.render('admin/products', { 
                pageTitle: 'View Products', 
                products, 
                path: '/admin/products',
                hasProducts: products.length > 0 
            });
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
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
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
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
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.updateProduct = (req, res) => {
    const { title, description, price, image} = req.body
    const file = req.file;
    Product.findOne({ _id: req.params.id, creator: req.user._id })
        .then(product => {
            if(!product) {
                return res.redirect('/')
            }
            product.title = title
            product.description = description
            product.price = price

            if(file) {
                deletFile(product.imageURL)
                product.imageURL = file.path
            }

            return product.save()
                .then(updatedProduct => {
                    res.redirect('/admin/products')
                })
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.deleteProduct = (req, res, next) => {
    Product.findOne({ _id: req.params.id, creator: req.user._id })
        .then(existingProduct => {
            if(!existingProduct) {
                return next(new Error('Product not found'))
            }
            
            deletFile(existingProduct.imageURL)
            return Product.deleteOne({ _id: req.params.id, creator: req.user._id })
        })
        .then(() => {
            res.redirect('/admin/products')
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })

    
}

exports.deleteProductAPI = (req, res, next) => {
    const id = req.params.id
    Product.findOne({ _id: id, creator: req.user._id })
        .then(existingProduct => {
            if(!existingProduct) {
                return next(new Error('Product not found'))
            }
            
            deletFile(existingProduct.imageURL)
            return Product.deleteOne({ _id: id, creator: req.user._id })
        })
        .then(() => {
            res.status(200).json({ data: true, message: 'success'})
        })
        .catch(error => {
            res.status(500).json({ data: false, message: 'Delete failed'})
        })

    
}