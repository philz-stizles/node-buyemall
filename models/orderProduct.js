const { DataTypes } = require('sequelize')
const sequelize = require('../db')

const OrderProduct = sequelize.define('OrderProduct', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    quantity: DataTypes.INTEGER
}, {
    tableName: 'OrderProducts'
});

module.exports = OrderProduct