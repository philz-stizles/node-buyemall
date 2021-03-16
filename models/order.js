const { getdb } = require('../db')
const mongodb = require('mongodb')

class Order {
    constructor(obj, id) {
        this._id = (id) ? mongodb.ObjectId(id) : null
        this.products = obj.products;
        this.user = obj.user;
    }

    static getAll(filter) {
        const db = getdb()
        return db.collection('orders')
            .find(filter)
            .toArray()
            .then(orders => orders)
            .catch(error => {
                console.log(error)
            })
    }

    static getById(id) {
        const db = getdb()
        return db.collection('orders') 
            .find({ _id: new mongodb.ObjectId(id) })
            .next()
            .then(order => {
                console.log(order);
                return order
            })
            .catch(error => {
                console.log(error)
            })
    }

    static getMany(filter) {
        if(filter.id) {
            filter.id = new mongodb.ObjectId(filter.id)
        }

        if(filter._id) {
            filter._id = new mongodb.ObjectId(filter._id)
        }
        console.log(filter)
        const db = getdb()
        return db.collection('orders') 
            .find(filter)
            .toArray()
            .then(orders => {
                console.log(orders);
                return orders
            })
            .catch(error => {
                console.log(error)
            })
    }
}

module.exports = Order