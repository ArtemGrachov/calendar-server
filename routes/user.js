const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/upload');

router.get('/', checkAuth, userController.getMyData);

router.patch(
    '/',
    checkAuth,
    // upload.imageUpload.single('avatar'),
    (req, res, next) => {
        upload.imageUpload.single('avatar')(req, res, err => {
            if (err) {
                err.statusCode = 422;
                next(err);
            }
            next();
        });
    },
    userController.updateUser
);

router.delete('/', checkAuth, userController.deleteUser);

module.exports = router;