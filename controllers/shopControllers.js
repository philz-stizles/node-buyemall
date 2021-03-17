const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')
const order = require('../models/order')
const Product = require('../models/product')

exports.getIndexView = async (req, res, next) => {
    console.log('getIndexView')
    const page = +req.query.page || 1
    const limit = +req.query.limit || 10
    const skip = (page - 1) * limit

    try {
        const { count: totalCount, rows: products } = await Product.findAndCountAll({ offset: skip, limit })

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
    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.getProductsView = (req, res, next) => {
    Product.findAll()
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

exports.getProductDetailView = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id)
        res.render('shop/product-details', { 
            pageTitle: 'Product Details', 
            product, 
            path: '/product-details',
            productExists: product !== null && product !== undefined 
        });
        
    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.addToCart = async (req, res, next) => {
    const productId = req.params.id
    console.log('add to cart')
    try {
        let cart = await req.user.getCart()
        if(!cart) {
            cart = await req.user.createCart()
        }
        const products = await cart.getProducts({ where: { id: productId } })
        let product
        console.log('products', products)
        
        if(products.length > 0) {
            product = products[0]
        }

        if(product) {
            console.log('product', product)
        
            const oldQuantity = product.CartProduct.quantity
            const newQuantity = oldQuantity + 1
            await cart.addProduct(product, { through: { quantity: newQuantity }})
        } else {
            const product = await Product.findByPk(productId)
            await cart.addProduct(product, { through: { quantity: 1 } }) // Use through to specify fields
            // unique to the many to many table
        }

        res.redirect('/cart')

    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.removeFromCart = async (req, res, next) => {
    const productId = req.body.id
    try {
        const cart = await req.user.getCart()
        const products = await cart.getProducts({ where: { id: productId } })
        const product = products[0]
        await product.CartProduct.destroy()

        res.redirect('/cart')

    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.getCartView = async (req, res, next) => {
    try{
        let products = []
        const cart = await req.user.getCart()
        if(cart) {
            products = await cart.getProducts({raw : true})
        }

        res.render('shop/cart', { 
            pageTitle: 'Your Cart',  
            path: '/cart',
            products: products
        });
    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.getCheckoutView = (req, res) => {
    res.render('shop/checkout', { 
        pageTitle: 'Checkout', 
        path: '/checkout'
    });
}

exports.getOrdersView = async (req, res, next) => {
    try {
        const orders = await req.user.getOrders({ include: ['Products'] })
        res.render('shop/orders', { 
            pageTitle: 'Your Orders',  
            path: '/orders',
            orders
        })

    } catch(error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
}

exports.createOrder = async (req, res, next) => {
    try {
        const cart = await req.user.getCart()
        const products = await cart.getProducts()
        console.log(products)
        const order = await req.user.createOrder()
        await order.addProducts(products.map(product => {
            product.OrderProduct = { quantity: product.CartProduct.quantity}
            return product
        }))
        // await cart.destroy()
        await cart.setProducts(null)
        res.redirect('/orders')
    } catch (error) {
        console.log(error)
        const err = new Error(error)
        err.httpStatusCode = 500
        return next(err)
    }
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