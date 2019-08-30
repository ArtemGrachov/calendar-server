const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const eventsController = require('../controllers/events');

router.post('/', checkAuth, eventsController.createEvent);

router.get('/', checkAuth, eventsController.getEvents);

router.patch('/:eventId', checkAuth, eventsController.updateEvent);

router.delete('/:eventId', checkAuth, eventsController.deleteEvent);

router.post('/:eventId/invites', checkAuth, eventsController.inviteUserToEvent);

router.delete('/:eventId/invites/:userId', checkAuth, eventsController.removeUserFromEvent);

router.delete('/:eventId/invites/', checkAuth, eventsController.leaveEvent);

module.exports = router;