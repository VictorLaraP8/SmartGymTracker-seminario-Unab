const express = require('express');
const router = express.Router();

const workoutController = require('../controllers/workout.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, workoutController.createWorkout);
router.get('/', verifyToken, workoutController.getWorkouts);
router.put('/:id', verifyToken, workoutController.updateWorkout);
router.delete('/:id', verifyToken, workoutController.deleteWorkout);

module.exports = router;