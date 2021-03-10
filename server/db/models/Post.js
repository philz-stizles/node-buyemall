const db = require('..')

class Post {
    constructor(obj) {
        this.title = obj.title
        this.content = obj.content
        this.imageUrl = obj.imageUrl || null
        this.creator = obj.creator
    }

    save() {
        console.log(this)
        const query = `INSERT INTO ${process.env.DB_NAME}.Posts(title, content, imageUrl, creator) VALUES(?, ?, ?, ?);`
        // execute will internally call prepare and query
        return db
            .execute(query, [this.title, this.content, this.imageUrl, this.creator])
            .then(([result]) => {
                console.log(result) // result contains metadata of execution
                return result
            })
            .catch(error => { 
                throw(error)
            })
    }

    static getAll() {
        const query = `SELECT title, content, createdAt FROM ${process.env.DB_NAME}.Posts`

        // execute will internally call prepare and query
        return db.execute(query)
    }

    static getById(id) {
        const query = `SELECT title, content, createdAt FROM ${process.env.DB_NAME}.Posts WHERE id=?`

        // execute will internally call prepare and query
        return db
            .execute(query, [id])
            .then(([result]) => {
                console.log(result) // result contains metadata of execution
                return result
            })
            .catch(error => { 
                throw(error)
            })
    }
}

module.exports = Post