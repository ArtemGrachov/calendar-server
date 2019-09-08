const User = require('../models/user');
const uploadDelete = require('../utils/upload-delete');
const errorFactory = require('../utils/error-factory');
const errors = require('../configs/errors');
const cloudinaryPromise = require('../utils/cloudinary-promise');

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

        const result = await cloudinaryPromise.upload(`uploads/${avatar.filename}`);

        const prevAvatar = user.avatar ? user.avatar.publicId : null;

        user.set({
            avatar: {
                url: result.secure_url,
                publicId: result.public_id
            }
        });

        uploadDelete(avatar.filename);

        if (prevAvatar) {
            await cloudinaryPromise.delete(prevAvatar);
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

        const prevAvatar = user.avatar ? user.avatar.publicId : null;

        if (prevAvatar) {
            await cloudinaryPromise.delete(prevAvatar);
        }

        user.set('avatar', null);

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
