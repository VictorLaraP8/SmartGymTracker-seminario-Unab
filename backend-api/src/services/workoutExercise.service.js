const workoutExerciseModel = require('../models/workoutExercise.model');
const workoutModel = require('../models/workout.model');

const addExerciseToWorkout = async ({ workoutId, userId, exerciseId, sets, reps, weight }) => {
  if (!exerciseId || !sets || !reps) {
    throw new Error('exerciseId, sets y reps son obligatorios');
  }

  if (Number(sets) <= 0 || Number(reps) <= 0) {
    throw new Error('sets y reps deben ser mayores a 0');
  }

  if (weight !== undefined && Number(weight) < 0) {
    throw new Error('weight no puede ser negativo');
  }

  const workout = await workoutModel.findWorkoutById(workoutId);

  if (!workout) {
    throw new Error('Workout no encontrado');
  }

  if (workout.user_id !== userId) {
    throw new Error('No tienes permiso para modificar este workout');
  }

  return await workoutExerciseModel.addExerciseToWorkout({
    workoutId,
    exerciseId,
    sets,
    reps,
    weight,
  });
};

const getWorkoutFullDetail = async ({ workoutId, userId }) => {
  const workout = await workoutModel.findWorkoutById(workoutId);

  if (!workout) {
    throw new Error('Workout no encontrado');
  }

  if (workout.user_id !== userId) {
    throw new Error('No tienes permiso para ver este workout');
  }

  const exercises = await workoutExerciseModel.getExercisesByWorkoutId(workoutId);

  return {
    id: workout.id,
    user_id: workout.user_id,
    type: workout.type,
    duration_minutes: workout.duration_minutes,
    workout_date: workout.workout_date,
    created_at: workout.created_at,
    exercises,
  };
};

const getWorkoutMetrics = async (workoutId, userId) => {
  const workout = await workoutModel.findWorkoutById(workoutId);

  if (!workout) {
    throw new Error('Workout no encontrado');
  }

  if (workout.user_id !== userId) {
    throw new Error('No tienes permiso para ver este workout');
  }

  const metrics = await workoutExerciseModel.getWorkoutMetrics(workoutId);

  return {
    workout_id: workout.id,
    type: workout.type,
    total_exercises: Number(metrics.total_exercises),
    total_sets: Number(metrics.total_sets),
    total_reps: Number(metrics.total_reps),
    total_volume: Number(metrics.total_volume),
  };
};

module.exports = {
  addExerciseToWorkout,
  getWorkoutFullDetail,
  getWorkoutMetrics,
};