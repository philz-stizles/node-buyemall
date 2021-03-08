const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true })

module.exports = Post = mongoose.model('Posts', PostSchema)