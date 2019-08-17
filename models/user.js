const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../configs/main');

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
    }],
    notifications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification'
    }]
});

userSchema.methods = {
    getPublicFields() {
        return {
            id: this._id,
            firstname: this.firstname,
            lastname: this.lastname,
            avatarUrl: this.avatarUrl
        }
    },
    getAllFields() {
        return {
            id: this._id,
            firstname: this.firstname,
            lastname: this.lastname,
            avatarUrl: this.avatarUrl,
            email: this.email
        }
    },
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
    },
    async addNotification(notificationId) {
        await this.updateOne({
            $addToSet: {
                'notifications': notificationId
            }
        })
    },
    async removeNotification(notificationId) {
        await this.updateOne({
            $pull: {
                'notifications': notificationId
            }
        })
    },
    getAuthTokens() {
        const token = jwt.sign(
            { userId: this._id.toString() },
            config.jwtKey,
            { expiresIn: config.tokenLife }
        );

        const refreshToken = jwt.sign(
            { userId: this._id.toString() },
            config.jwtRefreshKey,
            { expiresIn: config.refreshTokenLige }
        );

        return {
            token,
            refreshToken
        }
    }
}

userSchema.pre('remove', async function() {
    const events = await this
        .model('Event')
        .find({ _id: { $in: this.events }});

    const promises = events.map(event => {
        if (event.owner.toString() == this._id.toString()) {
            return event.remove();
        } else {
            return event.removeUser(this._id)
        }
    });

    await Promise.all(promises);
})

module.exports = mongoose.model('User', userSchema);