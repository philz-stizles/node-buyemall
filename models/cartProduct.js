const { DataTypes } = require('sequelize')
const sequelize = require('../db')

const CartProduct = sequelize.define('CartProduct', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    quantity: DataTypes.INTEGER
}, {
    tableName: 'CartProducts'
});

module.exports = CartProduct