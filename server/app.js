// npm install express body-parser cors express-validator multer dotenv
// npm install --save-dev nodemon
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// SETTING SECURE RESPONSE HEADERS
app.use(helmet());

// COMPRESSION
app.use(compression());

// LOGGING
// app.use(morgan());
// app.use(morgan('combined'));

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
            // cb(null, new Date().toISOString() + file.originalname);  // On Windows, the file name that includes a 
            // date string is not really supported and will lead to some strange CORS errors. Use the code below
            // cb(null, uuidv4()) OR the code below
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

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin')
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200)
    }
    next()
})

// You can have multiple static folders
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/', require('./routes/shop-routes'));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/admin', require('./routes/admin-routes'));
app.use('/api/v1/posts', require('./routes/postRoutes'));
app.use('/api/v1/products', require('./routes/product-routes'));

// Handle 404 Notfound routes
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

app.use((error, req, res, next) => {
    console.log(error)
    const status = error.statusCode || 500
    const data = error.data
    const message = error.message
    res.status(status).json({ status: false, message, data });
});

const PORT = process.env.PORT;

// Initialize DB
mongoose.connect(process.env.MONGODB_LOCAL_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('DB connected');
        const server = app.listen(PORT, (err) => {
            if(err) {
                console.log(`Could not start server ${err.message}`);
            }
            console.log(`Buy em'all Server running on PORT ${PORT}`);
        }); 
        
        const io = require('socket.io')(server, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "POST"],
                // allowedHeaders: ["my-custom-header"],
                // credentials: true
            }
        })
        io.on('connection', socket => {
            console.log(`Client connected`);
        })

    })
    .catch(error => console.log(error))