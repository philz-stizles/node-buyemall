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
router.post('/remove-from-cart', authenticate, shopControllers.removeFromCart) // alternative method passing 
// the id in the req.body


router.route('/checkout')
    .get(authenticate, shopControllers.getCheckoutView)

router.route('/orders')
    .post(authenticate, shopControllers.createOrder)
    .get(authenticate, shopControllers.getOrdersView)

router.route('/orders/:id')
    .get(authenticate, shopControllers.getInvoice)

module.exports = router;