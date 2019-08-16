const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const eventsController = require('../controllers/events');

router.post('/', checkAuth, eventsController.createEvent);

router.get('/', checkAuth, eventsController.getEvents);

router.patch('/:eventId', checkAuth, eventsController.updateEvent);

router.delete('/:eventId', checkAuth, eventsController.getOutFromEvent);

router.post('/invite', checkAuth, eventsController.inviteUserToEvent);

module.exports = router;