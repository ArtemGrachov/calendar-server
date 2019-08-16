const mongoose = require('mongoose');
const eventIcons = require('../configs/event-icons');

const eventSchema = mongoose.Schema({
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: string
    },
    icon: {
        type: String,
        enum: eventIcons
    },
    color: {
        type: String,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

module.exports = mongoose.model('Event', eventSchema);