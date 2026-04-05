const exerciseService = require('../services/exercise.service');

const createExercise = async (req, res) => {
  try {
    const newExercise = await exerciseService.createExercise(req.body);

    return res.status(201).json({
      success: true,
      message: 'Ejercicio creado correctamente',
      data: newExercise,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getExercises = async (req, res) => {
  try {
    const exercises = await exerciseService.getAllExercises();

    return res.status(200).json({
      success: true,
      message: 'Ejercicios obtenidos correctamente',
      data: exercises,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createExercise,
  getExercises,
};