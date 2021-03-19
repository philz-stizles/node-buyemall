const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, default: 'I am new!' },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Posts' }]
}, { timestamps: true })

module.exports = User = mongoose.model('Users', UserSchema)