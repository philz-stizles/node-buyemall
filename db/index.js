const mongodb = require('mongodb');
const MonogoClient = mongodb.MongoClient;

let _db;

exports.mongoConnect = cb => {
    console.log()
    MonogoClient.connect(process.env.MONGODB_CLOUD_URI)
        .then(client => {
            _db = client.db();
            console.log('DB Connected');
            cb(client);
        })
        .catch(error => {
            console.log(error);
            throw(error);
        });
}

exports.getdb = () => {
    if(_db){
        return _db;
    }

    throw 'No Database found';
}