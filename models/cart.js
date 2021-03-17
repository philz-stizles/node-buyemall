const { DataTypes } = require('sequelize')
const sequelize = require('../db');
const Product = require('./product');

const Cart = sequelize.define('Cart', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
})

module.exports = Cart