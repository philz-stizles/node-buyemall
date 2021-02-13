const path = require('path')
const products = require('./../data/products')

const getShop = (req, res) => {
    console.log(products)
    res.render('shop', { 
        pageTitle: 'Shop', 
        products, 
        activeShop: true, 
        shopCSS: true,
        hasProducts: products.length > 0 
    })
}

module.exports = { getShop }