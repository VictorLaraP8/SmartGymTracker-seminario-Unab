const exerciseModel = require('../models/exercise.model');

const createExercise = async ({ name, muscleGroup }) => {
  if (!name) {
    throw new Error('El campo name es obligatorio');
  }

  return await exerciseModel.createExercise({
    name,
    muscleGroup,
  });
};

const getAllExercises = async () => {
  return await exerciseModel.getAllExercises();
};

module.exports = {
  createExercise,
  getAllExercises,
};