const mongoose = require('mongoose');
const notificationsConfig = require('../configs/notifications');

const notificationSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: notificationsConfig.types
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Notifications', notificationSchema);