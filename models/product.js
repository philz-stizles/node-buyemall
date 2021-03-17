const { DataTypes } = require('sequelize')
const sequelize = require('../db');
const Cart = require('./cart');

const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    title: DataTypes.STRING,
    price: { type: DataTypes.DOUBLE, allowNull: false },
    imageURL: { type: DataTypes.STRING, allowNull: true},
    description: { type: DataTypes.STRING, allowNull: false}
}, {
    tableName: 'Products',
    // timestamps: true,
    // createdAt: false
})
// By default, Sequelize automatically adds the fields createdAt and updatedAt to every model, 
// using the data type DataTypes.DATE. Those fields are automatically managed as well - whenever you use 
// Sequelize to create or update something, those fields will be set correctly. The createdAt field will 
// contain the timestamp representing the moment of creation, and the updatedAt will contain the timestamp 
// of the latest update.

module.exports = Product