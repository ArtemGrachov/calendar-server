const Event = require('../models/event');
const User = require('../models/user');
const errorFactory = require('../utils/error-factory');
const errors = require('../configs/errors');

exports.createEvent = async (req, res, next) => {
    try {
        let start = req.body.start;
        let end = req.body.end;
        const title = req.body.title;
        const description = req.body.description;
        const icon = req.body.icon;
        const color = req.body.color;

        if (!start || !end || !title) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        start = new Date(start);
        end = new Date(end);

        const event = await new Event({
            start,
            end,
            title,
            description,
            icon,
            color,
            owner: req.userId
        }).save();

        res
            .status(201)
            .json({
                message: 'Event created successfully',
                event: event.getPublicFields()
            })
    } catch(err) {
        next(err);
    }
}

exports.getEvents = async (req, res, next) => {
    try {
        const start = req.params.start;
        const end = req.params.end;

        if (!start || !end) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const user = await User
            .findById(req.userId)
            .populate({
                path: 'events',
                match: {
                    start: { $lt: end },
                    end: { $gt: start }
                }
            });

        res
            .status(200)
            .json({
                message: 'Events fetched successfully',
                events: user
                    .events
                    .map(
                        event => event.getPublicFields()
                    )
            });
    } catch(err) {
        next(err);
    }
}

exports.updateEvent = async (req, res, next) => {
    try {
        const eventId = req.eventId;

        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (events.users.indexOf(req.userId) === -1) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const start = req.body.start;
        const end = req.body.end;
        const title = req.body.title;
        const description = req.body.description;
        const icon = req.body.icon;
        const color = req.body.color;

        const updData = {};
        
        if (start) {
            updData.start = start;
        }

        if (end) {
            updData.end = end;
        }

        if (title) {
            updData.title = title;
        }

        if (description) {
            updData.description = description;
        }

        if (icon) {
            updData.icon = icon;
        }

        if (color) {
            updData.color = color;
        }

        await event.set(updData);

        res
            .status(200)
            .json({
                message: 'Event updated successfully',
                event: event.getPublicFields()
            })
    } catch (err) {
        next(err);
    }
}

exports.deleteEvent = async (req, res, next) => {
    try {
        const eventId = req.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const userId = req.userId;

        if (event.owner === userId) {
            event.remove();

            res
                .status(200)
                .json({
                    message: 'Event deleted successfully',
                    eventId
                });
        } else {
            if (event.users.indexOf(userId)) {
                event.removeUser(userId);

                res
                    .status(200)
                    .json({
                        message: 'You successfully left the event'
                    });
            } else {
                throw errorFactory(404, errors.NOT_FOUND);
            }
        }
    } catch(err) {
        next(err);
    }
}

exports.inviteUserToEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const userId = req.userId;

        if (event.owner !== userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const userToInviteId = req.body.userId;
        const userToInvite = await User.findById(userToInviteId);

        if (!userToInvite) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        event.addUser(userToInviteId);

        res
            .status(200)
            .json({
                message: 'User successfully invited to event',
                userId: userToInviteId
            });
    } catch(err) {
        next(err);
    }
}

exports.removeUserFromEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const userId = req.userId;

        if (event.owner !== userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const userToRemoveId = req.params.userId;

        if (event.users.indexOf(userToRemoveId) === -1) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        event.removeUser(userToInviteId);

        res
            .status(200)
            .json({
                message: 'User successfully removed from event',
                userId: userToRemoveId
            });
    } catch(err) {
        next(err);
    }
}