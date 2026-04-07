const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { verifyToken, isTrainer } = require('../middlewares/auth.middleware');

router.get('/me/inactivity', verifyToken, userController.getMyInactivityStatus);
router.get('/me/alerts', verifyToken, userController.getUserAlerts);
router.get('/at-risk', verifyToken, isTrainer, userController.getUsersAtRisk);

module.exports = router;