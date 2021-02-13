const path = require('path')

const getShop = (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'shop.html'))
}

module.exports = { getShop }