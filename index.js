require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;
const errors = require('./configs/errors');
const config = require('./configs/main');
const socket = require('./socket');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const eventsRoutes = require('./routes/events');
const userRoutes = require('./routes/user');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');

app.use(authMiddleware);
app.use('/auth', authRoutes);
app.use('/events', eventsRoutes);
app.use('/user', userRoutes);
app.use('/notifications', notificationsRoutes);
app.use('/users', usersRoutes);

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

mongoose
    .connect(config.db)
    .then(
        () => {
            const server = app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
            socket.init(server);
        }
    )
    .catch(err => {
        console.log(err);
        console.log('Database connection error');
    });
