const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const filePath = path.join(__dirname, '..', 'data', 'users.json')
const readFromFile = (cb) => {
    fs.readFile(filePath, (error, fileContent) => {
        return (error) ? cb(null, error) : cb(JSON.parse(fileContent), null)
    })
}
class User {
    constructor(obj) {
        this.id = uuidv4() 
        this.username = obj.username
        this.email = obj.email
        this.password = obj.password
        this.avatar = obj.avatar
        this.imageURL = obj.imageURL
        this.resetToken = null
        this.resetTokenExpiration = null
        this.cart = {
            items: [{
                product: '',
                quantity: 0
            }]
        }
    }

    save(cb) {
        readFromFile(users => {
            users.unshift(this)

            fs.writeFile(filePath, JSON.stringify(users, null, 4), (error) => {
                
                if(error) {
                    console.log(error)
                    cb(null, error)
                } else {
                    cb(this, null)
                }
            })
            
        })
    }

    static findAll() {
        return users
    }

    static findById(id) {
        readFromFile(users => {
            const user = users.find(item => item.id === id)
            cb(user)
        })
    }

    static findByEmail(email, cb) {
        readFromFile((users, error) => {
            const user = users.find(item => item.email === email)
            cb(user, error)
        })
    }

    static findByIdAndUpdate(id, obj) {
        const index = users.findIndex(item => item.id === id)
        users[index] = obj
    }

    static findByIdAndDelete(id) {
        users = users.filter(item => item.id !== id)
    }

    static addToCart(product) {
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
    
    static removeFromCart(product) {
        const updatedCartItems = this.cart.items.filter(item => item.product.toString() !== product._id.toString())
    
        this.cart.items = updatedCartItems
    
        return this.save()
    }
}

module.exports = User