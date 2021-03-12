const path = require('path');
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
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

// Middlewares
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})

// STATIC FOLDER
// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')));

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

app.use((req, res, next) => {
    if(!req.session.user) {
        return next()
    }

    User.findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(error => console.log(error))
})

// SET LOCAL 
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isAuthenticated
    res.locals.csrfToken = req.csrfToken()
    next()
})

// MVC VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/', require('./routes/shopRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// Handle 404 Notfound routes
app.use(errorControllers.send404);

app.use((error, req, res, next) => {
    res.status(500).send(error.message);
});

// Initialize DB
console.log(process.env.MONGODB_LOCAL_URI)
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
            console.log(`
                Buy em'all Server running on PORT ${PORT}
                Client available @ http://localhost:${PORT}
            `);
        });   
    })
    .catch(error => console.log(error))