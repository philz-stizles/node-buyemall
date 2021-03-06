const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middlewares
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// res & req as you already know them from node HTTP, but with extra features
// app.use((req, res, next) => {})
// app.use('/', (req, res, next) => {})


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

app.listen(PORT, (err) => {
    if(err) {
        console.log(`Could not start server ${err.message}`);
    }
    console.log(`Buy em'all Server running on PORT ${PORT}`);
});