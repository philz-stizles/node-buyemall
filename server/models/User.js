const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamp: true })

module.exports = User = mongoose.model('Users', UserSchema)