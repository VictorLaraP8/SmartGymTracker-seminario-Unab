const workoutExerciseService = require('../services/workoutExercise.service');

const addExerciseToWorkout = async (req, res) => {
  try {
    const workoutId = Number(req.params.id);
    const userId = req.user.id;

    const newWorkoutExercise = await workoutExerciseService.addExerciseToWorkout({
      workoutId,
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Ejercicio agregado al workout correctamente',
      data: newWorkoutExercise,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkoutFullDetail = async (req, res) => {
  try {
    const workoutId = Number(req.params.id);
    const userId = req.user.id;

    const detail = await workoutExerciseService.getWorkoutFullDetail({
      workoutId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: 'Detalle del workout obtenido correctamente',
      data: detail,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addExerciseToWorkout,
  getWorkoutFullDetail,
};