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

notificationSchema.methods = {
    getPublicFields() {
        return {
            id: this._id,
            title: this.title,
            content: this.content,
            type: this.type
        }
    }
}

notificationSchema.pre('save', async function() {
    if (this.isNew) {
        const user = await this.model('User')
            .findById(this.user);

        await user.addNotification(this._id);
    }
});

notificationSchema.pre('remove', async function() {
    const user = await this.model('User')
        .findById(this.user);

    await user.removeNotification(this._id);

    const usersIds = [
        this.owner,
        ...this.users
    ];
    const users = await this.model('User').find({ _id: { $in: usersIds }});

    const promises = users.map(user => user.removeEvent(this._id));

    await Promise.all(promises);
});

module.exports = mongoose.model('Notification', notificationSchema);