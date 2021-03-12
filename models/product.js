const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

const products = []
class Product {
    constructor(obj) {
        this.id = uuidv4() 
        this.title = obj.title
        this.price = obj.price
        this.description = obj.description
        this.imageURL = obj.imageURL
        this.imageURL = obj.imageURL
    }

    save() {
        products.unshift(this)
    }

    static findAll() {
        return products
    }

    static findById(id) {
        return products.find(item => item.id === id)
    }

    static findByIdAndUpdate(id, obj) {
        const index = products.findIndex(item => item.id === id)
        products[index] = obj
    }

    static findByIdAndDelete(id) {
        products = products.filter(item => item.id !== id)
    }
}

module.exports = Product