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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
});

eventSchema.methods = {
    getPublicFields() {
        return {
            start: this.start,
            end: this.end,
            title: this.title,
            description: this.description,
            icon: this.icon,
            color: this.color,
            users: this.users
        }
    }
}

module.exports = mongoose.model('Event', eventSchema);