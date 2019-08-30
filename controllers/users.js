const User = require('../models/user');
const errors = require('../configs/errors');
const errorFactory = require('../utils/error-factory');

exports.searchByEmail = async (req, res, next) => {
    try {
        const email = req.query.email;

        if (!email) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const user = await User.findOne({ email });

        if (!user) {
            throw errorFactory(404, errors.NOT_FOUND);
        }

        res
            .status(200)
            .json({
                message: 'User found successfully',
                user: user.getPublicFields()
            })
    } catch (err) {
        next(err);
    }
}
