const User = require('../models/user');
const uploadDelete = require('../utils/upload-delete');

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
        const avatar = req.file;
        const updData = { };

        if (firstname != null) {
            updData.firstname = firstname;
        }

        if (lastname != null) {
            updData.lastname = lastname;
        }

        if (avatar) {
            updData.avatarUrl = avatar.filename;
        }

        const user = await User.findById(req.userId);

        const prevAvatar = user.avatarUrl;

        user.set(updData);

        if (prevAvatar) {
            uploadDelete(prevAvatar);
        }

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

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = req.userId;

        const user = await User.findById(userId);
        await user.remove();

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
