const express = require('express');
const { check, body } = require('express-validator');
const authControllers = require('../controllers/authControllers');

const router = express.Router();

router.route('/signup')
    .get(authControllers.getSignupView)
    .post([
        check('username').not().isEmpty().withMessage('Username is required'),
        check('email').isEmail().normalizeEmail().withMessage('Email is required'),
        body('password', 'Password must be greater than 6, and contain numbers and letters')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('cpassword').custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error('Passwords must match')
            }
            return true
        }).trim()
    ], authControllers.signup)

router.route('/login')
    .get(authControllers.getLoginView)
    .post([
        check('username'),
        check('email').isEmail().withMessage('Email is required') // .normalizeEmail()
    ], authControllers.login)

router.route('/forgot-password')
    .get(authControllers.getForgotPasswordView)
    .post([check('email').isEmail().withMessage('Email is required')], authControllers.submitForgotPassword)

router.post('/logout', authControllers.logout)

module.exports = router;