const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const mandrillTransport = require('nodemailer-mandrill-transport')

const transporter = nodemailer.createTransport(mandrillTransport({
    auth: {
        apiKey: process.env.MAILCHIMP_API_KEY
    }
}))

exports.getSignupView = (req, res) => {
    const messages = req.flash('error')

    res.render('auth/signup', { 
        pageTitle: 'Signup', 
        path: '/auth/signup',
        oldInput: { username: '', email: '', password: '' },
        errorMessage: (messages.length <= 0) ? null : messages
    });
}

exports.signup = (req, res) => {
    const { username, email, password } = req.body;
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/auth/signup',
            pageTitle: 'Signup',
            errorMessage: errors.array()[0].msg,
            oldInput: { username, email, password },
        })
    }

    User.findOne({ email })
        .then(user => {
            // Check that existing user does not exist
            if(user) {
                req.flash('error', 'User with email already exists')
                return res.redirect('/auth/signup')
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
                    console.log(process.env.MAILCHIMP_API_KEY)
                    transporter.sendMail({
                        to: newUser.email,
                        from: process.env.EMAIL_FROM,
                        subject: 'Signup succeeded',
                        html: `<h1>You successfully signed up!</h1>`
                    }, (error) => {
                        if (error) {
                            console.log(error);
                        } else {
                            res.redirect('/auth/login')
                        }
                    })
                })
                .catch(error => {
                    console.log(error)
                })
        })
        .catch(error => {
            console.log(error)
            return res.redirect('/auth/signup')
        })
}

exports.getLoginView = (req, res) => {
    res.render('auth/login', { 
        pageTitle: 'Login', 
        path: '/auth/login',
        oldInput: { email: '', password: '' },
        errorMessage: null,
        validationErrors: []
    });
}

exports.login = (req, res) => {
    const { email, password } = req.body;
    var errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/auth/login',
            pageTitle: 'Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()
        })
    }

    User.findOne({ email })
        .then(existingUser => {
            if(!existingUser) {
                return res.status(422).render('auth/login', {
                    path: '/auth/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password',
                    oldInput: { email, password },
                    validationErrors: []
                })
            }

            bcrypt
                .compare(password, existingUser.password)
                .then(isMatch => {
                    if(!isMatch) {
                        return res.status(422).render('auth/login', {
                            path: '/auth/login',
                            pageTitle: 'Login',
                            errorMessage: 'Invalid email or password',
                            oldInput: { email, password },
                            validationErrors: []
                        })
                    }
                    
                    console.log(existingUser)
                    // req.session is added by the express-session middleware
                    req.session.isAuthenticated = true
                    req.session.user = existingUser
                    req.session.save(error => {
                        // console.log(error)
                        return res.redirect('/')
                    })
                })
                .catch(error => {
                    console.log(error)
                    res.redirect('/auth/login')
                })

        })
        .catch(error => {
            console.log(error)
            res.redirect('/auth/login')
        })
}

exports.getForgotPasswordView = (req, res) => {
    const messages = req.flash('error')
    console.log(messages)

    res.render('auth/forgot-password', { 
        pageTitle: 'Forgot Password', 
        path: '/auth/forgot-password',
        oldInput: { email: ''},
        errorMessage: (messages.length <= 0) ? null : messages
    });
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
            return res.redirect('auth/forgot-password')
        }

        const token = buffer.toString('hex')
        User.findOne({ email })
            .then(existingUser => {
                if(!existingUser) {
                    req.flash('error', 'Email is not valid')
                    return res.redirect('auth/forgot-password')
                }
                console.log(Date.now)
                existingUser.resetToken = token
                existingUser.resetTokenExpiration = Date.now + (60 * 60 * 1000) // 1hr
                return existingUser.save()
            })
            .then(updatedUser => {
                transporter.sendMail({
                    to: updatedUser.email,
                    from: process.env.EMAIL_FROM,
                    subject: 'Password Reset',
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset-password/${token}">link</a> to set a new password.</p>
                    `
                })
            })
            .catch(error => condsol.log(error))
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