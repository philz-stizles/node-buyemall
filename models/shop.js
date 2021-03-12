const mongoose = require('mongoose')

const ShopSchema = new mongoose.Schema({
    company: { type: String, required: true },
    logo: { type: Number, required: true },
    addresses: { type: String, required: true }
}, { timestamps: true })

module.exports = Shop = mongoose.model('Shop', ShopSchema)