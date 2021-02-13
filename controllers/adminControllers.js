const path = require('path')
const products = require('./../data/products')


const createProduct = (req, res) => {
    console.log(req.method, req.body)
    if(req.method === 'POST') {
        products.push(req.body)
        res.redirect('/')
    } else {
        res.render('admin/create-product', { pageTitle: 'Create Product'})
    }
}

const getProduct = (req, res) => {

}

const getAllProducts = (req, res) => {

}

const updateProduct = (req, res) => {

}

const deleteProduct = (req, res) => {

}

module.exports = { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct }