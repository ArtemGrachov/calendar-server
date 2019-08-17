const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const authController = require('../controllers/auth');

router.post('/registration', authController.registration);

router.post('/login', authController.login);

router.patch('/password', checkAuth, authController.changePassword);

router.post('/refresh-token', authController.refreshToken);

module.exports = router;