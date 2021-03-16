const { getdb } = require('../db')
const mongodb = require('mongodb');
const Product = require('./product');

class User {
    constructor(obj) {
        this._id = obj.id || obj._id;
        this.username = obj.username;
        this.email = obj.email;
        this.password = obj.password;
        this.avatar = obj.avatar
        this.createdAt = Date.now()
        this.updatedAt = Date.now()
        this.cart = obj.cart
    }

    save() {
        const db = getdb()
        return db.collection('users').insertOne(this)
    }

    static getAll(filter) {
        const db = getdb()
        return db.collection('users')
            .find(filter)
            .toArray()
            .then(users => users)
            .catch(error => {
                console.log(error)
            })
    }

    static getById(id) {
        const db = getdb()
        return db.collection('users')
            .findOne({_id: new mongodb.ObjectId(id)})
            .then(user => user)
            .catch(error => {
                console.log(error)
            })
    }

    static getByEmail(email) {
        const db = getdb()
        return db.collection('users')
            .findOne({email})
            .then(user => user)
            .catch(error => {
                console.log(error)
            })
    }

    addToCart(product) {
        const updatedCartItems = (!this.cart) ? [] : [...this.cart.items]
        const existingProductIndex = updatedCartItems.findIndex(item => {
            return item.product.toString() === product._id.toString()
        })

        if(existingProductIndex >= 0) { // Product already in cart, increment quantity
            updatedCartItems[existingProductIndex].quantity += 1
        } else { // Product not in cart, add to cart
            updatedCartItems.push({ product: product._id, quantity: 1 })
        }
        
        const updatedCart = {
            items: updatedCartItems
        }

        const db = getdb()
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } });
    }

    removeFromCart(id) {
        const updatedCartItems = this.cart.items.filter(item => item.product.toString() !== id.toString())

        const db = getdb()
        return db
            .collection('users')
            .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } });
    }

    getCartItems() {
        const cartItems = this.cart.items
        const productIds = cartItems.map(item => item.product)
        const db = getdb()
        return db
            .collection('products')
            .find({ _id: { $in: productIds } })
            .toArray()
            .then(products => {
                return products.map(item => {
                    return {
                        ...item,
                        quantity: cartItems.find(i => i.product.toString() === item._id.toString()).quantity
                    }
                })
            })
    }

    clearCart() {
        this.cart.items = []
        const db = getdb()
        return db
            .collection('users')
            .updateOne(
                { _id: new mongodb.ObjectId(this._id) }, 
                { $set: { cart: { items: [] } } }
            );
    }

    createOrder() {
        const db = getdb()
        return this.getCartItems()
            .then(products => {
                const newOrder = {
                    products,
                    user: {
                        name: this.username,
                        userId: this._id
                    }
                }

                return db.collection('orders').insertOne(newOrder)
            })
            .then(() => {
                return this.clearCart()
            })
    }

    getOrders() {
        const db = getdb()
        console.log(this)
        return db.collection('orders') 
            .find({ 'user.userId': new mongodb.ObjectId(this._id) })
            .toArray()
            .then(orders => orders)
            .catch(error => {
                console.log(error)
            })
    }
}

module.exports = User