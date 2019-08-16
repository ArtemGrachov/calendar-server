const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const notificationsController = require('../controllers/notifications');

router.get('/', checkAuth, notificationsController.getNotifications);

router.delete('/:notificationId', checkAuth, notificationsController.deleteNotification);

module.exports = router;