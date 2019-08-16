const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User  = require('../models/user');
const config = require('../configs/main');
const errors = require('../configs/errors');

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
    };
    if (!validator.isLength(password, { min: 8, max: 18 })) {
        validationErrors.push('Invalid password');
    };
    if (password !== passwordConfirmation) {
        validationErrors.push('Passwords are not equal');
    };
    if (!firstname) {
        validationErrors.push('First name is required');
    };
    if (!lastname) {
        validationErrors.push('Last name is required');
    };
    
    if (validationErrors.length) {
        const error = new Error(errors.INVALID_INPUT);
        error.data = validationErrors;
        error.statusCode = 422;
        throw error;
    };

    const registeredUser = await User.findOne({ email });
    
    if (registeredUser) {
        const error = new Error(errors.EMAIL_ALREADY_REGISTERED);
        error.statusCode = 422;
        throw error;
    };

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
    };
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ email });

    try {
        if (!user) {
            const error = new Error(errors.INCORRECT_EMAIL_OR_PASSWORD);
            error.statusCode = 401;
            throw error;
        };

        const passwordCheck = await bcrypt.compare(password, user.password);

        if (!passwordCheck) {
            const error = new Error(errors.INCORRECT_EMAIL_OR_PASSWORD);
            error.statusCode = 401;
            throw error;
        };

        const token = jwt.sign(
            { userId: user._id.toString() },
            config.jwtKey,
            { expiresIn: '1h' }
        );

        res
        .status(200)
        .json({ token });
    } catch (err) {
        next(err);
    };
};
