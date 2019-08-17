const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User  = require('../models/user');
const config = require('../configs/main');
const errors = require('../configs/errors');
const errorFactory = require('../utils/error-factory');

exports.registration = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirmation = req.body.passwordConfirmation;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;

    const validationErrors = [];

    if (!validator.isEmail(email)) {
        validationErrors.push('Invalid email');
    }
    if (!validator.isLength(password, { min: 8, max: 18 })) {
        validationErrors.push('Invalid password');
    };
    if (password !== passwordConfirmation) {
        validationErrors.push('Passwords are not equal');
    }
    if (!firstname) {
        validationErrors.push('First name is required');
    }
    if (!lastname) {
        validationErrors.push('Last name is required');
    }
    
    if (validationErrors.length) {
        throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
    }

    const registeredUser = await User.findOne({ email });
    
    if (registeredUser) {
        throw errorFactory(422, errors.EMAIL_ALREADY_REGISTERED);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User({
        firstname,
        lastname,
        email,
        password: passwordHash,
    });

    await user.save();

    res
        .status(201)
        .json({ message: 'User registered successfully' });
    } catch(err) {
        next(err);
    }
}

exports.login = async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
    
        const user = await User.findOne({ email });

        if (!user) {
            throw errorFactory(401, errors.INCORRECT_EMAIL_OR_PASSWORD);
        }

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            throw errorFactory(401, errors.INCORRECT_EMAIL_OR_PASSWORD);
        }

        const tokens = user.getAuthTokens();

        res
            .status(200)
            .json(tokens);
    } catch (err) {
        next(err);
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const password = req.body.password;
        const passwordConfirmation = req.body.passwordConfirmation;

        if (!password || !passwordConfirmation) {
            throw errorFactory(422, errors.INVALID_INPUT);
        }

        const validationErrors = [];

        if (!validator.isLength(password, { min: 8, max: 18 })) {
            validationErrors.push('Invalid password');
        }

        if (password !== passwordConfirmation) {
            validationErrors.push('Passwords are not equal');
        }

        if (validationErrors.length) {
            throw errorFactory(422, errors.INVALID_INPUT, validationErrors);
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.findById(req.userId);

        user.set({ password: passwordHash });

        await user.save();

        res
            .status(200)
            .json({
                message: 'Password updated successfully'
            })
    } catch(err) {
        next(err);
    }
}

exports.refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (!refreshToken) {
            throw errorFactory(401, errors.INVALID_TOKEN);
        }

        const decodedToken = jwt.verify(refreshToken, config.jwtRefreshKey);

        if (!decodedToken) {
            throw errorFactory(401, errors.INVALID_TOKEN);
        }

        const tokenUserId = decodedToken.userId;

        if (tokenUserId === req.userId) {
            const user = await User.findById(tokenUserId);

            const tokens = user.getAuthTokens();

            res
                .status(200)
                .json(tokens);
        } else {
            throw errorFactory(401, errors.INVALID_TOKEN);
        }

    } catch (err) {
        next(err);
    }
}