const express = require('express');
const adminControllers = require('../controllers/adminControllers');

const router = express.Router();

router.route('/createProduct')
    .get(adminControllers.getCreateProduct)
    .post(adminControllers.postCreateProduct)

router.route('/viewProducts')
    .get(adminControllers.getViewProducts)

router.route('/:id')
    .get(adminControllers.getProduct)
    .put(adminControllers.updateProduct)
    .delete(adminControllers.deleteProduct)


module.exports = router;