const mongodb = require('mongodb')
const MonogoClient = mongodb.MongoClient


const mongoConnect = cb => {
    MonogoClient.connect(process.env.MONGODB_LOCAL_URI)
        .then(client => {
            console.log('DB Connected')
            cb(client)
        })
        .catch(error => console.log(error))
}

module.exports = mongoConnect