const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

exports.signup = (req, res) => {
    const { username, email, password } = req.body;
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({
            status: false,
            errorMessage: errors.array(),
            oldInput: { username, email, password }
        })
    }

    // Encrypt password
    const salt = bcrypt.genSaltSync(12);
    return bcrypt.hash(password, salt)
        .then(hashedPassword => {
            // Create new user
            const newUser = new User({ username, email, password: hashedPassword })
            return newUser.save()
        })
        .then(newUser => {
            res.status(201).json({ status: true, data: newUser, message: 'Created successfully'})
        })
        .catch(error => {
            console.log(error)
            if(!error.statusCode) {
                error.statusCode = 500
            }

            next(error)
        })
}

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    console.log(req.body)
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(400).json({
            status: false,
            errorMessage: errors.array(),
            oldInput: { email, password }
        })
    }

    User.findOne({ email })
        .then(existingUser => {
            if(!existingUser) {
                const error = new Error('Invalid email or password')
                error.statusCode = 401
                throw error
            }

            bcrypt
                .compare(password, existingUser.password)
                .then(isMatch => {
                    if(!isMatch) {
                        const error = new Error('Invalid email or password')
                        error.statusCode = 401
                        throw error
                    }

                    const { _id: id, username, email } = existingUser
                    console.log(process.env.JWT_AUTH_EXPIRESIN)
                    console.log(typeof process.env.JWT_AUTH_EXPIRESIN)
                    const token = jwt.sign({
                        id,
                        email
                    }, 
                    process.env.JWT_AUTH_SECRET, 
                    { 
                        expiresIn: +process.env.JWT_AUTH_EXPIRESIN  // Note that process.env.JWT_AUTH_EXPIRESIN
                        // might be a string if for example you are using nodemon.json, this will interpret expriesIn
                        // in milliseconds if no additional time unit is added
                        // This is why i added the plus(+) because i specified 1800 in nodemon.json which ideally 
                        // should be interpreted as seconds if its read as an integer, but rather it is read as a string
                        // thuus the conversion wit + to integer 
                    })
                    
                    return res.json({
                        status: true,
                        data: {
                            loggedInUser: { id, username, email },
                            token
                        },
                        message: 'Login successful'
                    })
                })
                .catch(error => {
                    console.log(error)
                    if(!error.statusCode) {
                        error.statusCode = 500
                    }

                    next(error)
                })

        })
        .catch(error => {
            console.log(error)
            if(!error.statusCode) {
                error.statusCode = 500
            }

            next(error)
        })
}

exports.submitForgotPassword = (req, res) => {
    const { email } = req.body;
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/forgot-password', {
            path: '/auth/forgot-password',
            pageTitle: 'Forgot Password',
            errorMessage: errors.array()[0].msg,
            oldInput: { email }
        })
    }

    // Generate token
    crypto.randomBytes(32, (error, buffer) => {
        if(error) {
            console.log(error)
            return res.redirect('/auth/forgot-password')
        }

        const token = buffer.toString('hex')
        User.findOne({ email })
            .then(existingUser => {
                if(!existingUser) {
                    req.flash('error', 'Email is not valid')
                    return res.redirect('/auth/forgot-password')
                }

                existingUser.resetToken = token
                existingUser.resetTokenExpiration = Date.now() + (60 * 60 * 1000) // 1hr
                existingUser.save()
                    .then(updatedUser => {
                        res.redirect('/')
                        transporter.sendMail({
                            to: updatedUser.email,
                            from: process.env.EMAIL_FROM,
                            subject: 'Password Reset',
                            html: `
                                <p>You requested a password reset</p>
                                <p>Click this <a href="${req.protocol}:${req.get('host')}/auth/new-password/${token}">link</a> to set a new password.</p>
                            `
                        })
                    })
                    .catch(error => {
                        console.log(error)
                        const err = new Error(error)
                        err.httpStatusCode = 500
                        return next(err)
                    })
            })
            .catch(error => {
                console.log(error)
                const err = new Error(error)
                err.httpStatusCode = 500
                return next(err)
            })
    })
}

exports.submitNewPassword = (req, res) => {
    const { newPassword, confirmNewPassword, userId, token } = req.body;
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/new-password', {
            path: '/auth/new-password',
            pageTitle: 'Reset Password',
            errorMessage: errors.array()[0].msg,
            oldInput: { newPassword, confirmNewPassword, userId, token }
        })
    }
    let updatedUser

    User.findOne({ _id: userId, resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
        .then(existingUser => {
            if(!existingUser) {
                req.flash('error', 'Email is not valid')
                return res.redirect('auth/forgot-password')
            }

            updatedUser = existingUser

            // Encrypt password
            const salt = bcrypt.genSaltSync(12);
            return bcrypt.hash(newPassword, salt)
        })
        .then(hashedPassword => {
            updatedUser.password = hashedPassword
            updatedUser.resetToken = undefined
            updatedUser.resetTokenExpiration = undefined
            return updatedUser.save()
        })
        .then(updatedUser => {
            res.redirect('/auth/login')
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.logout = (req, res) => {
    req.session.destroy(error => {
        if(error) {
            console.log(error)
        }
        res.redirect('/')
    })
}