const express = require('express');
const { createProduct, getProduct, getAllProducts, updateProduct, deleteProduct } = require('./../controllers/adminControllers');

const router = express.Router();

router.route('/')
    .get(createProduct)
    // .get(getAllProducts)

router.route('/:id')
    .get(getProduct)
    .put(updateProduct)
    .delete(deleteProduct)


module.exports = router;