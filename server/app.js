// npm install express body-parser cors express-validator multer dotenv
// npm install --save-dev nodemon
require('dotenv').config()
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// Middlewares
// parse application/x-www-form-urlencoded <form></form>
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})

// Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    next()
})

// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/shopRoute'));
app.use('/admin', require('./routes/adminRoute'));

// Handle 404 Notfound routes
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

app.use((error, req, res, next) => {
    res.status(500).send(error.message);
});

const PORT = process.env.PORT || 5000;

// Initialize DB
mongoose.connect(process.env.MONGOOSE_DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('DB connected');
        app.listen(PORT, (err) => {
            if(err) {
                console.log(`Could not start server ${err.message}`);
            }
            console.log(`Buy em'all Server running on PORT ${PORT}`);
        });   
    })
    .catch(error => console.log(error))