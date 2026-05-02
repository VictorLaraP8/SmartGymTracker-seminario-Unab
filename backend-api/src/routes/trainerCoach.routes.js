const express = require('express');
const router = express.Router();

const { verifyToken, isTrainer } = require('../middlewares/auth.middleware');
const { ensureTrainerClient } = require('../middlewares/coach.middleware');
const trainerCoachController = require('../controllers/trainerCoach.controller');

router.use(verifyToken, isTrainer);

router.get('/', trainerCoachController.listClients);
router.post('/', trainerCoachController.assignByEmail);
router.post('/:clientId/messages', ensureTrainerClient, trainerCoachController.sendMessageToClient);
router.post(
  '/:clientId/recommendations',
  ensureTrainerClient,
  trainerCoachController.sendRecommendation
);

module.exports = router;
