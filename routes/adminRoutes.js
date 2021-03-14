
const express = require('express');
const { check, body } = require('express-validator');
const adminControllers = require('../controllers/adminControllers');
const { authenticate } = require('../middlewares/authMiddlewares');

const router = express.Router();

router.route('/create-product')
    .get(authenticate, adminControllers.getCreateProductView)
    .post([
        check('title')
            .trim()
            .not().isEmpty().withMessage('Title is required')
            .isString().withMessage('Enter a valid title')
            .isLength({ min: 3 }).withMessage('Title must not be less then 3 characters'),
        check('price')
            .isFloat()
            .withMessage('Please enter a valid price'),
        check('description')
            .trim()
            .isLength({ min: 5, max: 200 }).withMessage('Description should be greater than 5 characters but less then 200')
    ], authenticate, adminControllers.createProduct)

router.route('/products')
    .get(adminControllers.getProductsView)

router.get('/product-detail/:id', adminControllers.getProductDetailView)
    
router.route('/update-product/:id')
    .get(authenticate, adminControllers.getProductUpdateView)
    .post([
        check('title')
        .trim()
        .not().isEmpty().withMessage('Title is required')
        .isString().withMessage('Enter a valid title')
        .isLength({ min: 3 }).withMessage('Title must not be less then 3 characters'),
        check('price')
            .isFloat()
            .withMessage('Please enter a valid price'),
        check('description')
            .trim()
            .isLength({ min: 5, max: 200 }).withMessage('Description should be greater than 5 characters but less then 200')
    ], authenticate, adminControllers.updateProduct)

// router.post('/delete-product/:id', authenticate, adminControllers.deleteProduct)
router.delete('/products/:id', authenticate, adminControllers.deleteProductAPI)

module.exports = router;