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
        type: String
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

userSchema.methods = {
    async addEvent(eventId) {
        await this.updateOne({
            $addToSet: {
                'events': eventId
            }
        })
    },
    async removeEvent(eventId) {
        await this.updateOne({
            $pull: {
                'events': eventId
            }
        })
    }
}
module.exports = mongoose.model('User', userSchema);