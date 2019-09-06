const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/upload');

router.get('/', checkAuth, userController.getMyData);

router.patch(
    '/',
    checkAuth,
    upload.images,
    userController.updateUser
);

router.delete('/', checkAuth, userController.deleteUser);

module.exports = router;