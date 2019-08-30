const Event = require('../models/event');
const User = require('../models/user');
const Notification = require('../models/notification');
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

        const validationErrors = [];

        if (!title) {
            validationErrors.push('Event title is required');
        }

        if (!start) {
            validationErrors.push('Start date is required');
        }

        if (!end) {
            validationErrors.push('End date is required');
        }

        if (start && end) {
            start = new Date(start);
            end = new Date(end);

            if (start >= end) {
                validationErrors.push('Invalid dates');
            }
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

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
        const start = req.query.start;
        const end = req.query.end;

        if (!start || !end) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const user = await User
            .findById(req.userId)
            .populate({
                path: 'events',
                match: {
                    start: { $lte: end },
                    end: { $gte: start }
                }
            });

        const usersIds = Array.from(user.events.reduce(
            (acc, curr) => {
                curr.users.forEach(userId => {
                    acc.add(userId.toString())
                });
                acc.add(curr.owner);
                return acc;
            }, new Set()
        ));

        const users = await User
            .find({ _id: { $in: usersIds }});

        res
            .status(200)
            .json({
                message: 'Events fetched successfully',
                events: user
                    .events
                    .map(
                        event => event.getPublicFields()
                    ),
                users: users.map(user => user.getPublicFields())
            });
    } catch(err) {
        next(err);
    }
}

exports.updateEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;

        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        if (event.owner != req.userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const start = req.body.start;
        const end = req.body.end;
        const title = req.body.title;
        const description = req.body.description;
        const icon = req.body.icon;
        const color = req.body.color;

        const updData = {};
        
        if (start != null) {
            updData.start = start;
        }

        if (end != null) {
            updData.end = end;
        }

        if (title != null) {
            updData.title = title;
        }

        if (description != null) {
            updData.description = description;
        }

        if (icon != null) {
            updData.icon = icon;
        }

        if (color != null) {
            updData.color = color;
        }

        event.set(updData);
        await event.save();

        if (event.users && event.users.length) {
            const nPromises = event.users.map(
                user => {
                    const notification = new Notification({
                        title: event.title,
                        content: `Event "${event.title}" has been updated`,
                        type: 'info',
                        user
                    });

                    return notification.save();
                }
            );

            await Promise.all(nPromises);
        }


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
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const userId = req.userId;

        if (event.owner == userId) {
            const promises = [
                event.remove()
            ];
            const usersIds = event.users;

            if (usersIds && usersIds.length) {
                const nPromises = usersIds.map(user => {
                    const notification = new Notification({
                        title: event.title,
                        content: `Event "${event.title}" has been deleted`,
                        type: 'warning',
                        user
                    });

                    return notification.save();
                });

                promises.push(...nPromises);
            }

            await Promise.all(promises);

            res
                .status(200)
                .json({
                    message: 'Event deleted successfully',
                    eventId
                });
        } else {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }
    } catch(err) {
        next(err);
    }
}

exports.leaveEvent = async (req, res, next) => {
    try {
        const eventId = req.params.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const userId = req.userId;

        if (event.owner === userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);            
        }

        if (event.users.indexOf(userId) !== -1) {
            const user = await User.findById(userId);
            const removePromise = event.removeUser(userId);

            const notification = new Notification({
                title: event.title,
                content: `User ${user.firstname} ${user.lastname} has left event "${event.title}"`,
                type: 'warning',
                user: event.owner
            });

            promises = [
                removePromise,
                user.removeEvent(eventId),
                notification.save()
            ];

            await Promise.all(promises);

            res
                .status(200)
                .json({
                    message: 'You successfully left the event',
                    eventId
                });
        } else {
            throw errorFactory(404, errors.NOT_FOUND);
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

        if (event.owner != userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const userToInviteId = req.body.userId;
        const userToInvite = await User.findById(userToInviteId);

        if (!userToInvite) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const notification = new Notification({
            title: event.title,
            content: `You have been invited to "${event.title}"`,
            type: 'info',
            user: userToInviteId
        });

        await Promise.all([
            event.addUser(userToInviteId),
            userToInvite.addEvent(eventId),
            notification.save()
        ])

        res
            .status(200)
            .json({
                message: 'User successfully invited to event',
                eventId,
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

        if (event.owner != userId) {
            throw errorFactory(403, errors.NOT_AUTHORIZED);
        }

        const userToRemoveId = req.params.userId;
        const userToRemove = await User.findById(userToRemoveId);

        if (event.users.indexOf(userToRemoveId) === -1) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        const notification = new Notification({
            title: event.title,
            content: `You have been removed from "${event.title}"`,
            type: 'warning',
            user: userToRemoveId
        });

        await Promise.all([
            event.removeUser(userToRemoveId),
            userToRemove.removeEvent(eventId),
            notification.save()
        ]);

        res
            .status(200)
            .json({
                message: 'User successfully removed from event',
                eventId,
                userId: userToRemoveId
            });
    } catch(err) {
        next(err);
    }
}