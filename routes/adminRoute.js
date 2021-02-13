const express = require('express');
const productControllers = require('../controllers/productsControllers');

const router = express.Router();

router.route('/')
    .get(productControllers.getCreateProduct)
    .post(productControllers.postCreateProduct)

router.route('/:id')
    .get(productControllers.getProduct)
    .put(productControllers.updateProduct)
    .delete(productControllers.deleteProduct)


module.exports = router;