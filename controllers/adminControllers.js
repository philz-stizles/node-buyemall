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

exports.createProduct = async (req, res, next) => {
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

    try {
        // METHOD 1
        // const product = await Product.create(
        //     { title, description, price, creator: req.user.id, imageURL: file.path },
        //     { fields: ['title', 'description', 'price', 'creator', 'imageURL'] }
        // )
        // METHOD 2
        // Sequelize automatically creates these special magic functions when you define associations
        // E.g. createProduct, getProducts, since a product belongs to a User
        const product = await req.user.createProduct({ title, description, price, imageURL: file.path })
        
        console.log(product)
        res.redirect('/admin/products')

    } catch (error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.getProductsView = async (req, res, next) => {
    try {
        // METHOD 1
        // const products = await Product.findAll({ 
        //     where: { creator: req.user.id }, 
        //     // attributes: []
        // })
        // METHOD 2
        // Sequelize automatically creates these special magic functions when you define associations
        // E.g. createProduct, getProducts, since a product belongs to a User
        const products = await req.user.getProducts()

        res.render('admin/products', { 
            pageTitle: 'View Products', 
            products, 
            path: '/admin/products',
            hasProducts: products.length > 0 
        });
    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
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

exports.getProductUpdateView = async (req, res, next) => {
    try {
        // METHOD 1
        // const product = await Product.findByPk(req.params.id)
        // METHOD 2
        // Sequelize automatically creates these special magic functions when you define associations
        // E.g. createProduct, getProducts, since a product belongs to a User
        const product = await req.user.getProducts({ where: { id: req.params.id } })
        res.render('admin/update-product', { 
            pageTitle: 'View Products', 
            product: product[0], 
            path: '/admin/update-product',
            productExists: product !== null && product !== undefined 
        });
    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.updateProduct = async (req, res, next) => {
    const { title, description, price, image} = req.body
    const file = req.file;
    console.log(req.body)
    try {
        const existingProduct = await Product.findOne({ where: { id: req.params.id, creator: req.user.id } })
        console.log(existingProduct)
        if(!existingProduct) {
            return res.redirect('/')
        }

        const dataValues = existingProduct.dataValues

        existingProduct.title = title
        existingProduct.description = description
        existingProduct.price = price

        if(file) {
            deletFile(existingProduct.imageURL)
            existingProduct.imageURL = file.path
        }

        await existingProduct.save()
                
        // await Product.update(dataValues, { where: { id: req.params.id, creator: req.user.id } })

        res.redirect('/admin/products')

    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const existingProduct = await Product.findOne({ where: { id: req.params.id, creator: req.user.id } })
        if(!existingProduct) {
            return next(new Error('Product not found'))
        }
            
        deletFile(existingProduct.imageURL)
        await existingProduct.destroy()
        
        res.redirect('/admin/products')

    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.deleteProductAPI = async (req, res, next) => {
    try {
        const existingProduct = await Product.findOne({ where: { id: req.params.id, creator: req.user.id } })
        if(!existingProduct) {
            return next(new Error('Product not found'))
        }
            
        deletFile(existingProduct.imageURL)
        await Product.destroy({ where: { id: req.params.id, creator: req.user.id } })
        
        res.status(200).json({ data: true, message: 'success'})

    } catch(error) {
        res.status(500).json({ data: false, message: 'Delete failed'})
    }
}