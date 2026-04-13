const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, isTrainer } = require('../middlewares/auth.middleware');

router.get('/me', verifyToken, dashboardController.getMyDashboard);
router.get('/recommendations', verifyToken, dashboardController.getMyRecommendations);
router.get('/adherence', verifyToken, dashboardController.getMyAdherence);
router.get('/score', verifyToken, dashboardController.getUserScore);
router.get('/ranking', verifyToken, isTrainer, dashboardController.getUsersRanking);
router.get('/missions', verifyToken, dashboardController.getMyMissions);
router.get('/achievements', verifyToken, dashboardController.getMyAchievements);

module.exports = router;