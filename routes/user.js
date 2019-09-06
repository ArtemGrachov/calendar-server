const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/upload');

router.get('/', checkAuth, userController.getMyData);

router.patch('/', checkAuth, userController.updateUser);

router.post('/avatar', checkAuth, upload.images, userController.uploadAvatar);

router.delete('/avatar', checkAuth, userController.deleteAvatar);

router.delete('/', checkAuth, userController.deleteUser);

module.exports = router;