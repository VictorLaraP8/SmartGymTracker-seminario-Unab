const express = require('express');
const router = express.Router();

const workoutsController = require('../controllers/workout.controller');
const workoutExerciseController = require('../controllers/workoutExercise.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

router.post('/', verifyToken, workoutsController.createWorkout);
router.get('/', verifyToken, workoutsController.getWorkouts);
router.get('/history', verifyToken, workoutsController.getWorkoutHistory);
router.get('/progress', verifyToken, workoutsController.getWorkoutProgress);

router.put('/:id', verifyToken, workoutsController.updateWorkout);
router.delete('/:id', verifyToken, workoutsController.deleteWorkout);

router.post('/:id/exercises', verifyToken, workoutExerciseController.addExerciseToWorkout);
router.get('/:id/detail', verifyToken, workoutExerciseController.getWorkoutFullDetail);
router.get('/:id/metrics', verifyToken, workoutExerciseController.getWorkoutMetrics);

module.exports = router;