const workoutService = require('../services/workout.service');

const createWorkout = async (req, res) => {
  try {
    const userId = req.user.id;

    const newWorkout = await workoutService.createWorkoutForUser({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      message: 'Workout creado correctamente',
      data: newWorkout,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const getWorkouts = async (req, res) => {
  try {
    const userId = req.user.id;
    const workouts = await workoutService.getWorkoutsByUser(userId);

    return res.status(200).json({
      message: 'Workouts obtenidos correctamente',
      data: workouts,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const updateWorkout = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    const updatedWorkout = await workoutService.updateWorkoutById({
      id,
      userId,
      ...req.body,
    });

    return res.status(200).json({
      message: 'Workout actualizado correctamente',
      data: updatedWorkout,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

const deleteWorkout = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;

    await workoutService.deleteWorkoutById({ id, userId });

    return res.status(200).json({
      message: 'Workout eliminado correctamente',
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
};