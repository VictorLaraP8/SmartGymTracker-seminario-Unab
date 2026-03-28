const workoutModel = require('../models/workout.model');

const createWorkoutForUser = async ({ userId, type, durationMinutes, workoutDate }) => {
  if (!type) {
    throw new Error('El campo type es obligatorio');
  }

  if (!durationMinutes) {
    throw new Error('El campo durationMinutes es obligatorio');
  }

  if (Number(durationMinutes) <= 0) {
    throw new Error('durationMinutes debe ser mayor a 0');
  }

  return await workoutModel.createWorkout({
    userId,
    type,
    durationMinutes,
    workoutDate: workoutDate || null,
  });
};

const getWorkoutsByUser = async (userId) => {
  return await workoutModel.findWorkoutsByUser(userId);
};

const updateWorkoutById = async ({ id, userId, type, durationMinutes, workoutDate }) => {
  if (!type) {
    throw new Error('El campo type es obligatorio');
  }

  if (!durationMinutes) {
    throw new Error('El campo durationMinutes es obligatorio');
  }

  if (Number(durationMinutes) <= 0) {
    throw new Error('durationMinutes debe ser mayor a 0');
  }

  const existingWorkout = await workoutModel.findWorkoutById(id);

  if (!existingWorkout) {
    throw new Error('Workout no encontrado');
  }

  if (existingWorkout.user_id !== userId) {
    throw new Error('No tienes permiso para modificar este workout');
  }

  return await workoutModel.updateWorkout({
    id,
    userId,
    type,
    durationMinutes,
    workoutDate: workoutDate || null,
  });
};

const deleteWorkoutById = async ({ id, userId }) => {
  const existingWorkout = await workoutModel.findWorkoutById(id);

  if (!existingWorkout) {
    throw new Error('Workout no encontrado');
  }

  if (existingWorkout.user_id !== userId) {
    throw new Error('No tienes permiso para eliminar este workout');
  }

  return await workoutModel.deleteWorkout({ id, userId });
};

module.exports = {
  createWorkoutForUser,
  getWorkoutsByUser,
  updateWorkoutById,
  deleteWorkoutById,
};