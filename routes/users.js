const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const usersController = require('../controllers/users');

router.get('/search', checkAuth, usersController.searchByEmail);

module.exports = router;
