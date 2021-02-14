const { v4: uuidv4 } = require('uuid');
const products = [];

module.exports = class Product {
    constructor(title, description, price, imageUrl) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    save() {
        this.id = uuidv4()
        products.push(this)
    }

    static fetchAll() {
        return products
    }

    static fetchById(id) {
        return products.find(p => p.id === id)
    }

    updateById(id) {
        const targetProduct = products.find(p => p.id === id)
        targetProduct.title = this.title;
        targetProduct.description = this.description;
        targetProduct.price = this.price;
    }

    static removeById(id) {
        products = products.filter(p => p.id !== id)
    }
}