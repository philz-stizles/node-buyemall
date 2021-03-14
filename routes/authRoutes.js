const express = require('express');
const { check, body } = require('express-validator');
const authControllers = require('../controllers/authControllers');

const router = express.Router();

router.route('/signup')
    .get(authControllers.getSignupView)
    .post([
        check('username').not().isEmpty().withMessage('Username is required'),
        check('email').isEmail().withMessage('Email is required').normalizeEmail(),
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
        check('email').trim().isEmail().withMessage('Email is required').normalizeEmail(),
        check('password').trim().isLength({ min: 6 }).withMessage('Password must be greater than 6 characters')
    ], authControllers.login)

router.route('/forgot-password')
    .get(authControllers.getForgotPasswordView)
    .post([check('email').isEmail().withMessage('Email is required')], authControllers.submitForgotPassword)

router.route('/new-password/:token')
    .get(authControllers.getNewPasswordView)
    
router.route('/new-password')
    .post([
        body('newPassword', 'Password must be greater than 6, and contain numbers and letters')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('confirmNewPassword').custom((value, { req }) => {
            if(value !== req.body.newPassword) {
                throw new Error('Passwords must match')
            }
            return true
        }).trim()
    ], authControllers.submitNewPassword)

router.post('/logout', authControllers.logout)

module.exports = router;