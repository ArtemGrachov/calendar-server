const User = require('../models/user');
const uploadDelete = require('../utils/upload-delete');
const errorFactory = require('../utils/error-factory');
const errors = require('../configs/errors');

exports.getMyData = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);

        res
            .status(200)
            .json({
                message: 'User data fetched successfully',
                user: user.getAllFields()
            })
    } catch(err) {
        next(err);
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const firstname = req.body.firstname;
        const lastname = req.body.lastname;
        const updData = { };

        if (firstname != null) {
            updData.firstname = firstname;
        }

        if (lastname != null) {
            updData.lastname = lastname;
        }

        const user = await User.findById(req.userId);

        user.set(updData);

        await user.save();

        res
            .status(200)
            .json({
                message: 'User data updated successfully',
                user: user.getAllFields()
            })
    } catch(err) {
        next(err);
    }
}

exports.uploadAvatar = async (req, res, next) => {
    try {
        const avatar = req.file;

        if (!avatar) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const user = await User.findById(req.userId);

        const prevAvatar = user.avatarUrl;

        user.set({
            avatarUrl: avatar.filename
        });

        if (prevAvatar) {
            uploadDelete(prevAvatar);
        }

        await user.save();

        res
            .status(200)
            .json({
                message: 'Avatar image uploaded successfully',
                user: user.getAllFields()
            })
    } catch(err) {
        next(err);
    }
}

exports.deleteAvatar = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        const prevAvatar = user.avatarUrl;

        if (prevAvatar) {
            uploadDelete(prevAvatar);
        }

        user.set({
            avatarUrl: null
        });

        await user.save();

        res
            .status(200)
            .json({
                message: 'Avatar image uploaded successfully',
                user: user.getAllFields()
            })
    } catch (err) {
        next(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        const avatarUrl = user.avatarUrl;

        await user.remove();

        if (avatarUrl) {
            uploadDelete(avatarUrl);
        }

        res
            .status(200)
            .json({
                message: 'User removed successfully',
                userId
            });
    } catch(err) {
        next(err);
    }
}
