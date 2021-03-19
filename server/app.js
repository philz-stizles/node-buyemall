// npm install express body-parser cors express-validator multer dotenv
// Graphql - npm install express-graphql graphql
// npm install --save-dev nodemon
require('dotenv').config()
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const { graphqlHTTP } = require('express-graphql');
const { graphqlAuth } = require('./graphql/utils/auth');
const authMiddleware = require('./middlewares/authMiddleware');
const { deletFile } = require('./utils/file-utils');

const app = express();

// Middlewares
// parse application/x-www-form-urlencoded <form></form>
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// parse Files
app.use(multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads')
        },
        filename: (req, file, cb) => {
            // cb(null, new Date().toISOString() + file.originalname);  // On Windows, 
            // the file name that includes a date string is not really supported and will 
            // lead to some strange CORS errors. Use the code below cb(null, uuidv4()) OR the code below
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, uniqueSuffix + '_' + file.originalname)
        }
    }),
    fileFilter: (req, file, cb) => {
        if(!process.env.FILE_ALLOWED_TYPES.includes(file.mimetype)) {
            // cb(new Error('File type is invalid'))
            cb('File type is invalid', false)
        }

        cb(null, true)
    },
    limits: {
        fileSize: process.env.FILE_MAX_SIZE
    }
}).single('image'));

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})

// Cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // A fix for graphql response with status of 405 (Method Not Allowed)
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/', require('./routes/shop-routes'));
app.use('/auth', require('./routes/auth-routes'));
app.use('/admin', require('./routes/admin-routes'));
app.use('/api/v1/posts', require('./routes/post-routes'));
app.use('/api/v1/products', require('./routes/product-routes'));

// Add graphql Auth middleware
app.use(authMiddleware)

// Add graphql upload file api
app.put('/upload', (req, res, next) => {
    console.log(req.isAuth)
    if (!req.isAuth) {
        throw new Error('Not authenticated!');
    }
    
    if (!req.file) {
        return res.json({ message: 'No file provided!' });
    }
    
    if (req.body.oldPath) {
        deletFile(req.body.oldPath);
    }
    
    return res.status(201).json({ message: 'File stored.', filePath: req.file.path });
})

// Graphql
app.use('/graphql', graphqlAuth, graphqlHTTP({
    schema: require('./graphql/schema'),
    rootValue: require('./graphql/resolvers'),
    graphiql: true,
    customFormatError(error) {
        if(!error.originalError) {
            return error
        }

        const data = error.originalError.data
        const message = error.originalError.message || 'An error occured'
        const status = error.originalError.status || 500

        return { message, status, data }
    }
}))

// Handle 404 Notfound routes
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

app.use((error, req, res, next) => {
    res.status(500).send(error.message);
});

const PORT = process.env.PORT || 5000;

// Initialize DB
mongoose.connect(process.env.MONGODB_LOCAL_URI, {
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