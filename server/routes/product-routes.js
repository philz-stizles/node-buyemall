const express = require('express');
const { body } = require('express-validator')
const { createProduct, getAllProducts, getProduct, updateProduct, deleteProduct } = require('../controllers/productControllers');

const router = express.Router();

router.route('/')
    .post([
        body('title').trim().isLength({ min: 5 }),
        body('content').trim().isLength({ min: 5 })
    ], createProduct)
    .get(getAllProducts)

router.route('/:id')
    .put(updateProduct)
    .get(getProduct)
    .delete(deleteProduct)

module.exports = router;