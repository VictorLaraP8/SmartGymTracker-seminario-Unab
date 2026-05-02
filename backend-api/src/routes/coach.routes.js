const express = require('express');
const router = express.Router();

const { verifyToken, isUser } = require('../middlewares/auth.middleware');
const coachController = require('../controllers/coach.controller');

router.use(verifyToken, isUser);

router.get('/', coachController.getSummary);
router.get('/messages', coachController.getMessages);
router.post('/messages', coachController.postMessage);
router.get('/recommendations', coachController.getRecommendations);
router.patch('/recommendations/:id/read', coachController.patchRecommendationRead);

module.exports = router;
