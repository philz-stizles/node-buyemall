const { DataTypes } = require('sequelize')
const sequelize = require('../db')
const Product = require('./product');
const Order = require('./order');
const Cart = require('./cart');

const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    resetToken: { type: DataTypes.STRING, allowNull: true },
    resetTokenExpiration : { type: DataTypes.DATE, allowNull: true }
}, {
    tableName: 'Users'
})

module.exports = User