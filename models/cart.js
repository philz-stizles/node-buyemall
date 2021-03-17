const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const filePath = path.join(__dirname, '..', 'data', 'cart.json')
const readFromFile = (cb) => {
    fs.readFile(filePath, (error, fileContent) => {
        return (error) ? cb({}) : cb(JSON.parse(fileContent))
    })
}

class Cart {
    static addToCart(id, cb) {
        readFromFile(cart => {
            if(cart) {
                const updatedProduct = { products: [], totalPrice: 0 }
                const products = cart.products
                const totalPrice = cart.totalPrice

                if(Array.isArray(products)) {
                    const existingProduct = products.find(item => item.id === id)
                    if(existingProduct) {
                        existingProduct.quantity += 1 
                    } else {
                        products.unshift({ id, quantity: 1})
                    }

                    fs.writeFile(filePath, JSON.stringify(cart), (error) => {
                        if(error) {
                            console.log(error)
                            cb(null, error)
                        } else {
                            cb(this, null)
                        }
                    })
                }
            }            
        })
    }

    static removeFromCart(cb) {
        readFromFile(cb)
    }

    static findById(id, cb) {
        readFromFile(products => {
            const product = products.find(item => item.id === id)
            cb(product)
        })
    }

    static findByIdAndUpdate(id, obj) {
        const index = products.findIndex(item => item.id === id)
        products[index] = obj
    }

    static findByIdAndDelete(id) {
        products = products.filter(item => item.id !== id)
    }
}

module.exports = Cart