// npm install express body-parser cors express-validator multer dotenv
// Graphql - npm install express-graphql graphql
// npm install --save-dev nodemon
require('dotenv').config()
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { graphqlHTTP } = require('express-graphql');

const db = require('./db/mysql')
const { graphqlAuth } = require('./graphql/utils/auth');


const app = express();

// Middlewares
// parse application/x-www-form-urlencoded <form></form>
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse Files
app.use(multer({
    storage: null,
    fileFilter: null
}).single('image'));

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})

// Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/shop-route'));
app.use('/api/v1/auth', require('./routes/auth-route'));
app.use('/admin', require('./routes/admin-route'));
app.use('/api/v1/posts', require('./routes/post-route'));

// Graphql
app.use('/graphql', graphqlAuth, graphqlHTTP({
    schema: require('./graphql/schema'),
    rootValue: require('./graphql/resolvers'),
    graphiql: true
}))

// Handle 404 Notfound routes
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

app.use((error, req, res, next) => {
    res.status(500).send(error.message);
});

const PORT = process.env.PORT;

        app.listen(PORT, (err) => {
            if(err) {
                console.log(`Could not start server ${err.message}`);
            }
            console.log(`Buy em'all Server running on PORT ${PORT}`);
        });   