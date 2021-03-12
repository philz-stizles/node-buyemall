const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, require: true }
        }]
    }
}, { timestamps: true })

userSchema.methods.addToCart = function(product) {
    const updatedCartItems = [...this.cart.items]
    console.log()
    const existingProductIndex = updatedCartItems.findIndex(item => {
        console.log(item.product, product._id)
        console.log(typeof item.product, typeof product._id)
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

    this.cart = updatedCart

    return this.save()
}

userSchema.methods.removeFromCart = function(product) {
    const updatedCartItems = this.cart.items.filter(item => item.product.toString() !== product._id.toString())

    this.cart.items = updatedCartItems

    return this.save()
}


module.exports = User = mongoose.model('User', userSchema)