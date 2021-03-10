const { Sequelize } = require('sequelize')
const sequelize = require('../')

const Product = sequelize.define('Product', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
    name: Sequelize.STRING,
    price: { type: Sequelize.DOUBLE, allowNull: false },
    imageUrl: { type: Sequelize.STRING, allowNull: false},
    description: { type: Sequelize.STRING, allowNull: false}
})

module.exports = Product