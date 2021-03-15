const { getdb } = require('../db')

class Product {
    constructor(obj) {
        this.title = obj.title;
        this.price = obj.price;
        this.description = obj.description;
        this.imageURL = obj.imageURL;
        this.creator = obj.creator;
    }

    save() {
        const db = getdb()
        db.collection('products').insertOne(this)
    }
}

module.exports = Product