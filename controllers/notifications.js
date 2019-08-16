const User = require('../models/user');
const Notification = require('../models/notification');
const errorFactory = require('../utils/error-factory');
const errors = require('../configs/errors');

exports.getNotifications = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User
            .findById(userId)
            .populate('notifications');

        res
            .status(200)
            .json({
                message: 'Notifications fetched successfully',
                notifications: user
                    .notifications
                    .map(notification => notification.getPublicFields)
            });
    } catch(err) {
        next(err);
    }
}

exports.deleteNotification = async (req, res, next) => {
    try {
        const userId = req.userId;
        const notificationId = req.params.notificationId;

        const notification = Notification.findById(notificationId);

        if (!notification) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (notification.user != userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }
    } catch(err) {
        next(err);
    }
}
