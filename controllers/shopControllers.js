const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const order = require('../models/order')
const Product = require('../models/product')

exports.getIndexView = (req, res, next) => {
    const page = +req.query.page || 1
    const limit = +req.query.limit || 10
    const skip = (page - 1) * limit
    let totalCount = 0

    Product.countDocuments()
        .then(count => {
            totalCount = count 
            return Product.find()
                .skip(skip)
                .limit(limit)
        })
        .then(products=> {
            res.render('shop/', { 
                pageTitle: 'Shop', 
                products, 
                path: '/',
                pagination: {
                    currentPage:page,
                    totalCount,
                    hasProducts: products.length > 0,
                    hasPreviousPage: page > 1,
                    hasNextPage: (limit * page) < totalCount,
                    nextPage: page + 1,
                    previousPage: page - 1,
                    lastPage: Math.ceil(totalCount/limit)
                }
            })
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.getProductsView = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', { 
                pageTitle: 'Shop', 
                products, 
                path: '/shop/products',
                hasProducts: products.length > 0 
            })
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
    
}

exports.getProductDetailView = (req, res, next) => {
    Product.findById(req.params.id)
        .then(product => {
            res.render('shop/product-details', { 
                pageTitle: 'Product Details', 
                product, 
                path: '/product-details',
                productExists: product !== null && product !== undefined 
            });
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.addToCart = (req, res) => {
    Product.findById(req.params.id)
        .then(product => {
            return req.user.addToCart(product)
        })
        .then(updatedUser => {
            res.redirect('/cart')
        })
        .catch(error => {
            console.log(error)
        })
}

exports.removeFromCart = (req, res) => {
    req.user.removeFromCart(req.body.id)
        .then(updatedUser => res.redirect('/cart'))
        .catch(error => {
            console.log(error)
        })
}

exports.getCartView = (req, res) => {
    req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
            res.render('shop/cart', { 
                pageTitle: 'Your Cart',  
                path: '/cart',
                products: user.cart.items,
            });
        })
        .catch(error => {
            console.log(error)
        })
}

exports.getCheckoutView = (req, res) => {
    res.render('shop/checkout', { 
        pageTitle: 'Checkout', 
        path: '/checkout'
    });
}

exports.getOrdersView = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id})
        .then(orders => {
            console.log(orders)
            res.render('shop/orders', { 
                pageTitle: 'Your Orders',  
                path: '/orders',
                orders
            });
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.createOrder = (req, res, next) => {
    req.user
        .populate('cart.items.product')
        .execPopulate()
        .then(user => {
            const products = user.cart.items.map(item => { 
                return { quantity: item.quantity, product: { ...item.product._doc } }
            })
            const newOrder = new Order({
                products,
                user: {
                    name: user.username,
                    userId: user
                }
            })

            return newOrder.save()
        })
        .then(result => {
            console.log(result)
            return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.id
    Order.findById(orderId)
        .then(existingOrder => {
            if(!existingOrder) {
                return next(new Error('Order does not exist'))
            }

            if(existingOrder.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'))
            }

            const invoiceName = `invoice-${orderId}.pdf`
            const invoicePath = path.join('data', 'invoices', invoiceName)
            // fs.readFile(invoicePath, (error, data) => {
            //     if(error) {
            //         return next(error)
            //     }

            //     res.setHeader('Content-Type', 'application/pdf') // Set the content type so the client knows and 
            //     // can handle it better
            //     res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
            //     res.send(data)
            // })

            // const file = fs.createReadStream(invoicePath)
            // res.setHeader('Content-Type', 'application/pdf') // Set the content type so the client knows and 
            // // can handle it better
            // res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
            // file.pipe(res)

            const pdfDoc = new PDFDocument()
            res.setHeader('Content-Type', 'application/pdf') // Set the content type so the client knows and 
            // can handle it better
            res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`)
            pdfDoc.pipe(fs.createWriteStream(invoicePath))
            pdfDoc.pipe(res)
            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            })
            pdfDoc.text('------------------------')
            let totalPrice = 0
            existingOrder.products.forEach(({ quantity, product })=> {
                totalPrice += quantity * product.price
                pdfDoc.fontSize(14).text(`${product.title} - ${quantity}x $${product.price}`)
            })
            pdfDoc.text('------------------------')
            pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`)
            pdfDoc.end()
        })
        .catch(error => {
            console.log(error)
            const err = new Error(error)
            err.httpStatusCode = 500
            return next(err)
        })
}