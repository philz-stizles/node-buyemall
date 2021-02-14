const express = require('express');
const shopControllers = require('../controllers/shopControllers');

const router = express.Router();

router.route('/')
    .get(shopControllers.getProductList)

router.route('/productDetails/:id')
    .get(shopControllers.getProductDetails)

router.route('/cart')
    .get(shopControllers.getCart)

router.route('/checkout')
    .get(shopControllers.getCheckout)

router.route('/orders')
    .get(shopControllers.getOrders)

module.exports = router;