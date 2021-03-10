const { validationResult } = require('express-validator')
const Product = require('../models/Product')

exports.createProduct = (req, res) => {
    const errors = validationResult(req.body)
    if(!errors.isEmpty()) {
        return res.status(400).send({ data: errors.array() })
    }

    const { title, content, imageUrl } = req.body

    const newProduct = new Product({ title, content, imageUrl, creator: 'Theo' })
    newProduct.save()
        .then((result) => {
            return res.status(201).send({ status: false, data: result, message: 'Created' })
        })
        .catch(error => console.log(error))
}

exports.getProduct = (req, res) => {
    Product.findById(req.params.id)
        .then((post) => {
            if(!post) {
                const error = new Error('Product not found')
                error.statusCode = 404
                throw error
            }
            res.status(200).send({ status: true, data: post, message: 'Retrieved' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.getAllProducts = async (req, res) => {
    Product.find()
        .then((posts) => {
            res.status(200).send({ status: true, data: posts, message: 'Retrieved' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}

exports.updateProduct = (req, res) => {

}

exports.deleteProduct = (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then((post) => {
            if(!post) {
                const error = new Error('Product not found')
                error.statusCode = 404
                throw error
            }
            res.status(200).send({ status: true, data: post, message: 'Deleted' })
        })
        .catch(error => {
            console.log(error)
            if(!error) {
                error.statusCode = 500
            }
            next(error)
        })
}