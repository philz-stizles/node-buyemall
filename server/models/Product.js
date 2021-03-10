const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
}, { timestamps: true })

module.exports = Product = mongoose.model('Products', ProductSchema)