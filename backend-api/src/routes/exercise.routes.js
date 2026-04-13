const express = require('express');
const router = express.Router();

const exerciseController = require('../controllers/exercise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, exerciseController.createExercise);
router.get('/', verifyToken, exerciseController.getExercises);

module.exports = router;