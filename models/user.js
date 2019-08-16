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