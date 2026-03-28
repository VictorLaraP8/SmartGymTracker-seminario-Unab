const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.get('/profile', verifyToken, userController.getProfile);

module.exports = router;