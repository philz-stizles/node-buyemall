const db = require('./../db/mysql')
class User {
    constructor(obj) {
        this.username = obj.username
        this.email = obj.email
        this.password = obj.password
    }

    save() {
        console.log(this)
        const query = `INSERT INTO ${process.env.DB_NAME}.Users (username, email, password) VALUES(?, ?, ?);`
        // execute will internally call prepare and query
        return db
            .execute(query, [this.username, this.email, this.password])
            .then(([result]) => {
                console.log(result) // result contains metadata of execution
                return result
            })
            .catch(error => { 
                throw(error)
            })
    }
}

module.exports = User