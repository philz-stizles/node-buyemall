
const express = require('express');
const { check, body } = require('express-validator');
const adminControllers = require('../controllers/adminControllers');
const { authenticate } = require('../middlewares/authMiddlewares');

const router = express.Router();

router.route('/create-product')
    .get(authenticate, adminControllers.getCreateProductView)
    .post([
        check('title')
            .isAlphanumeric()
            .isLength({ min: 3 })
            .withMessage('Please enter a valid title')
            .trim(),
        check('imageURL')
            .isURL()
            .withMessage('Please enter a valid URL'),
        check('price')
            .isFloat()
            .withMessage('Please enter a price'),
        check('description')
            .isLength({ min: 5, max: 200 })
            .withMessage('Please enter a valid description')
            .trim(),
    ], authenticate, adminControllers.createProduct)

router.route('/products')
    .get(adminControllers.getProductsView)

router.get('/product-detail/:id', adminControllers.getProductDetailView)
    
router.route('/update-product/:id')
    .get(authenticate, adminControllers.getProductUpdateView)
    .post([
        check('title')
            .isAlphanumeric()
            .isLength({ min: 3 })
            .withMessage('Please enter a valid title')
            .trim(),
        check('imageURL')
            .isURL()
            .withMessage('Please enter a valid URL'),
        check('price')
            .isFloat()
            .withMessage('Please enter a price'),
        check('description')
            .isLength({ min: 5, max: 200 })
            .withMessage('Please enter a valid description')
            .trim(),
    ], authenticate, adminControllers.updateProduct)

router.post('/delete-product/:id', authenticate, adminControllers.deleteProduct)

module.exports = router;