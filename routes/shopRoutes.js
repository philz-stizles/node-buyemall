const express = require('express');
const { authenticate } = require('../middlewares/authMiddlewares');
const shopControllers = require('../controllers/shopControllers');

const router = express.Router();

router.route('/')
    .get(shopControllers.getIndexView)

router.route('/products')
    .get(shopControllers.getProductsView)

router.route('/product-details/:id')
    .get(shopControllers.getProductDetailView)

router.get('/cart', authenticate, shopControllers.getCartView)
router.post('/add-to-cart/:id', authenticate, shopControllers.addToCart)
router.post('/remove-from-cart/:id', authenticate, shopControllers.removeFromCart)


router.route('/checkout')
    .get(authenticate, shopControllers.getCheckoutView)

router.route('/orders')
    .post(authenticate, shopControllers.createOrder)
    .get(authenticate, shopControllers.getOrdersView)

module.exports = router;