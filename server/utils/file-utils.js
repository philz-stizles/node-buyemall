const fs = require('fs')

exports.deletFile = (filePath) => {
    fs.unlink(filePath, error => {
        if(error) {
            throw(error)
        }
    })
}