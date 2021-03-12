const fs = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')

const filePath = path.join(__dirname, '..', 'data', 'products.json')
const readFromFile = (cb) => {
    fs.readFile(filePath, (error, fileContent) => {
        return (error) ? cb([]) : cb(JSON.parse(fileContent))
    })
}

class Product {
    constructor(obj) {
        this.id = uuidv4() 
        this.title = obj.title
        this.price = obj.price
        this.description = obj.description
        this.imageURL = obj.imageURL
        this.imageURL = obj.imageURL
    }

    save(cb) {
        readFromFile(products => {
            products.unshift(this)

            fs.writeFile(filePath, JSON.stringify(products), (error) => {
                
                if(error) {
                    console.log(error)
                    cb(null, error)
                } else {
                    cb(this, null)
                }
            })
            
        })
    }

    static findAll(cb) {
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

module.exports = Product