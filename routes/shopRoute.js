const express = require('express');
const { getShop } = require('./../controllers/shopControllers');

const router = express.Router();

router.route('/')
    .get(getShop)

// router.use('/:id')
//     .put()
//     .get()
//     .delete()

module.exports = router;