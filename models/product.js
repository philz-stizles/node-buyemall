const { getdb } = require('../db')
const mongodb = require('mongodb')

class Product {
    constructor(obj, id) {
        this._id = (id) ? mongodb.ObjectId(id) : null
        this.title = obj.title;
        this.price = obj.price;
        this.description = obj.description;
        this.imageURL = obj.imageURL;
        this.creator = obj.creator;
    }

    save() {
        const db = getdb()
        let dpOp

        if(this._id) {
            dpOp = db.collection('products').updateOne({ _id: this._id }, { $set: this })
        } else {
            dpOp = db.collection('products').insertOne(this)
        }
        return dpOp
            .then(result => {
                console.log(result)
            })
            .catch(error => {
                console.log(error)
            })
    }

    static getAll(filter) {
        const db = getdb()
        return db.collection('products')
            .find(filter)
            .toArray()
            .then(products => products)
            .catch(error => {
                console.log(error)
            })
    }

    static getById(id) {
        console.log(id)
        const db = getdb()
        return db.collection('products') 
            .find({ _id: new mongodb.ObjectId(id) })
            .next()
            .then(product => {
                console.log(product);
                return product
            })
            .catch(error => {
                console.log(error)
            })
    }

    static getOne(filter) {
        if(filter.id) {
            filter.id = new mongodb.ObjectId(filter.id)
        }

        if(filter._id) {
            filter._id = new mongodb.ObjectId(filter._id)
        }
        console.log(filter)
        const db = getdb()
        return db.collection('products') 
            .find(filter)
            .next()
            .then(product => {
                console.log(product);
                return product
            })
            .catch(error => {
                console.log(error)
            })
    }

    static findOneAndUpdate(filter, updatedItem) {
        const db = getdb()
        if(filter._id) {
            filter._id = new mongodb.ObjectId(filter._id)
        }

        return db.collection('products').updateOne(filter, { $set: updatedItem })
            .then(result => {
                console.log(result)
            })
            .catch(error => {
                console.log(error)
            })
    }

    static findOneAndDelete(filter) {
        if(filter._id) {
            filter._id = new mongodb.ObjectId(filter._id)
        }
        console.log(filter)
        const db = getdb()
        return db.collection('products') 
            .deleteOne(filter)
            .then(result => {
                console.log(result);
                return product
            })
            .catch(error => {
                console.log(error)
            })
    }
}

module.exports = Product