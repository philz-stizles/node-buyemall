const path = require('path')

const createProduct = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'create-product.html'))
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