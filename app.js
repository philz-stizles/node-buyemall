const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const expressSession = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(expressSession);
const csrf = require('csurf');
const flash = require('connect-flash');
const errorControllers = require('./controllers/errorControllers');

const app = express();

// SESSION STORE
// Store sessions in mongodb
const sessionStore = new MongoDbStore({
    uri: process.env.MONGODB_LOCAL_URI,
    collection: 'sessions'
})

// CSRF PROTECTION - INITIALIZE
const csrfProtection = csrf();

// FLASH MESSAGES
app.use(flash());

// STATIC FOLDER
// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PARSE application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false })); // urlencoded data is basicly text data. So if a form is 
// submitted without a file but other text fields, it is all encoded in text when the form is submitted. If it
// a file form field it would be encoded as empty text because it cant extract the file as text because the 
// file is binary data

// PARSE application/json
app.use(bodyParser.json());

// PARSE FILE(S) from form - multipart/form-data
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + '_' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    // if(file.size > process.env.FILE_MAX_SIZE) {
    //     cb(new Error('File is too large'))
    // }

    if(!process.env.FILE_ALLOWED_TYPES.includes(file.mimetype)) {
        // cb(new Error('File type is invalid'))
        cb('File type is invalid', false)
    }

    cb(null, true)
}

app.use(multer({ storage: storage, fileFilter, limits: {
    fileSize: process.env.FILE_MAX_SIZE
  }}).single('image'))  // req.file

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})

// SESSION
// npm install express-session
// By default this uses memory which may be fine for dev or testing. However, memory is not an infinite resource
// This would be bad for production with 1000's of users
// Make use of a session store => npm install connect-monogodb-session
app.use(expressSession({
    secret: process.env.SESSION_SECRET, // This is used for sigining the hash that secretly stores 
    // the authenticated users id in the cookie
    resave: false, // This means that the session will not be saved on every request that is sent
    // but only if something changedin the session
    saveUninitialized: false,
    store: sessionStore // Add a store to use rather than memory
    // Explore other configs
}))

// CSRF PROTECTION - APPLY MIDDLEWARE
app.use(csrfProtection)

// SET LOCAL 
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated
    res.locals.csrfToken = req.csrfToken()
    next()
})

app.use((req, res, next) => {
    if(!req.session.user) {
        return next()
    }

    User.findById(req.session.user._id)
        .then(user => {
            if(!user) {
                return next()
            }
            req.user = user
            next()
        })
        .catch(error => {
            throw new Error(error)
        })
})

// MVC VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/shopRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Handle 500 redirects
app.get('/500', errorControllers.send500);

// Handle 404 Notfound routes
app.use(errorControllers.send404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).send(error.message);
    // res.redirect('/500')
    res.status(500).render('500', { pageTitle: 'Error!', path: '/500', isAuthenticated: req.session.isAuthenticated })
});

// Initialize DB & start Server
mongoose.connect(process.env.MONGODB_LOCAL_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('DB connected');

        const PORT = process.env.PORT
        app.listen(PORT, (err) => {
            if(err) {
                console.log(`Could not start server ${err.message}`);
            }
            console.log(`Buy em'all Server running on PORT ${PORT}`);
        });   
    })
    .catch(error => console.log(error))