const path = require('path')
const products = require('./../data/products')

const getShop = (req, res) => {
    console.log(products)
    res.render('shop.pug', { pageTitle: 'Shop', products })
}

module.exports = { getShop }