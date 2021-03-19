const fs = require('fs')

exports.deletFile = (filePath) => {
    console.log('deleteFile', filePath)
    if(fs.existsSync(filePath)) {
        console.log("The file exists.");
        return fs.unlink(filePath, error => {
            if(error) {
                throw(error)
            }
        })
    } else {
        console.log('The file does not exist.');
    }
}