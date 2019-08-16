const User = require('../models/user');

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
        const avatarUrl = req.body.avatarUrl;

        const updData = { };

        if (firstname != null) {
            updData.firstname = firstname;
        }

        if (lastname != null) {
            updData.lastname = lastname;
        }

        if (avatarUrl != null) {
            updData.avatarUrl = avatarUrl;
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
