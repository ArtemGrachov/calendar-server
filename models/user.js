const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    avatarUrl: {
        type: String,
        required: true
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

module.exports = mongoose.model('User', userSchema);