const express = require('express');
const productControllers = require('./../controllers/productsControllers');

const router = express.Router();

router.route('/')
    .get(productControllers.getAllProducts)

module.exports = router;