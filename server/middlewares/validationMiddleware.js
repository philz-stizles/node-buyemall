const { body } = require('express-validator');
const User = require('../models/user');

exports.signupValidator = [
    body('username')
        .trim()
        .not().isEmpty().withMessage('Username is required'),
    body('email')
        .trim()
        .isEmail().withMessage('A valid email is required')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then(exisiingUser => {
                    console.log(exisiingUser)
                    // Validate that there is no existing user with proposed email
                    if(exisiingUser) {
                        return Promise.reject('E-mail address already exists')
                    }
                    // return Promise.resolve()
                })
            
        })
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 6 }).withMessage('A valid password not less than 6 characters'),
    // body('confirmPassword')
    //     .trim()
    //     .custom((value, { req }) => {
    //         if(value !== req.body.password) {
    //             throw new Error('Passwords must match')
    //         }
    //         return true
    //     })
]

exports.loginValidator = [
    body('email')
        .trim()
        .isEmail().withMessage('Invalid username or password')
        .normalizeEmail(),
    body('password')
        .trim()
        .isLength({ min: 6 }).withMessage('Invalid username or password'),
]