const workoutService = require('../services/workout.service');

const createWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const workout = await workoutService.createWorkout({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Workout creado correctamente',
      data: workout,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const workouts = await workoutService.getWorkouts(userId);

    return res.status(200).json({
      success: true,
      message: 'Workouts obtenidos correctamente',
      data: workouts,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const workout = await workoutService.updateWorkout({
      id,
      userId,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Workout actualizado correctamente',
      data: workout,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await workoutService.deleteWorkout(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Workout eliminado correctamente',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkoutHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const history = await workoutService.getWorkoutHistory(userId);

    return res.status(200).json({
      success: true,
      message: 'Historial de workouts obtenido correctamente',
      data: history,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkoutProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await workoutService.getWorkoutProgress(userId);

    return res.status(200).json({
      success: true,
      message: 'Progreso obtenido correctamente',
      data: progress,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutHistory,
  getWorkoutProgress,
};