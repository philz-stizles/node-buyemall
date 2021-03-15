const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupValidator, loginValidator } = require('../middlewares/validationMiddleware');

const router = express.Router();

router.post('/signup', signupValidator, signup)
router.post('/login', loginValidator, login)
router.post('/forgotPassword', signup)
router.post('/resetPassword', login)

module.exports = router;