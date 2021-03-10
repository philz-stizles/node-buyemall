const mysql = require('mysql2')

const pool = mysql.createPool({
    host: process.env.DB_LOCAL_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    multipleStatements: true
})

const createDatabase = `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.Users (
        id INT(11) NOT NULL AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NULL,
        isActive BOOL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
    ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;
`

const createPostsTable = `
    CREATE TABLE IF NOT EXISTS ${process.env.DB_NAME}.Posts (
        id INT NOT NULL AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content VARCHAR(255) NOT NULL,
        imageUrl VARCHAR(255) NULL,
        creator INT(11),
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME on UPDATE CURRENT_TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (creator) REFERENCES Users(id)
    ) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1;
`

const createQuery = `
    ${createDatabase}
    ${createUsersTable}
    ${createPostsTable}
`
// console.log(createQuery)

pool.query(createQuery, function(error, results, fields) {
    if (error) {
        console.log(error.message);
    }
    console.log("Tables and rows created...")
});

module.exports = pool.promise()