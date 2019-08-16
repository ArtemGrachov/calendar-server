const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errors = require('./configs/errors');

const config = require('./configs/main');

const PORT = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const userRoutes = require('./routes/user');

app.use(authMiddleware);
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/user', userRoutes);

app.use((err, req, res, next) => {
    console.log(err);

    const resError = {message: err.statusCode ? err.message : errors.SERVER_ERROR };
    if (err.data) {
        resError.data = err.data;
    };
    res
        .status(err.statusCode || 500)
        .json(resError);
});

mongoose.connect(config.db)
.then(
    () => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
)
.catch(err => {
    console.log('Database connection error');
});
