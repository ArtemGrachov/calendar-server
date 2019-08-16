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
        type: String
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
            id: this._id,
            start: this.start,
            end: this.end,
            title: this.title,
            description: this.description,
            icon: this.icon,
            color: this.color,
            users: this.users
        }
    },
    async addUser(userId) {
        await this.updateOne({
            $addToSet: {
                users: userId
            }
        })
    },
    async removeUser(userId) {
        await this.updateOne({
            $pull: {
                users: userId
            }
        })
    }
}

eventSchema.pre('save', async function() {
    if (this.isNew) {
        const user = await this.model('User')
            .findById(this.owner);

        await user.addEvent(this._id);
    }
})

eventSchema.pre('remove', async function() {
    const usersIds = [
        this.owner,
        ...this.users
    ];
    const users = await this.model('User').find({ _id: { $in: usersIds }});

    const promises = users.map(user => user.removeEvent(this._id));

    await Promise.all(promises);
})

module.exports = mongoose.model('Event', eventSchema);