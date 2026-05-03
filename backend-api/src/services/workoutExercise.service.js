const workoutExerciseModel = require('../models/workoutExercise.model');
const workoutModel = require('../models/workout.model');

const normalizeOptionalRir = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error('RIR debe ser un número entero entre 0 y 10, o dejarse vacío');
  }
  if (n < 0 || n > 10) {
    throw new Error('RIR debe estar entre 0 y 10');
  }
  return n;
};

const normalizeOptionalRpe = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error('RPE debe ser un número entre 6 y 10, o dejarse vacío');
  }
  if (n < 6 || n > 10) {
    throw new Error('RPE debe estar entre 6 y 10');
  }
  return Math.round(n * 10) / 10;
};

const addExerciseToWorkout = async ({
  workoutId,
  userId,
  exerciseId,
  sets,
  reps,
  weight,
  rir,
  rpe,
}) => {
  if (!exerciseId || !sets || !reps) {
    throw new Error('exerciseId, sets y reps son obligatorios');
  }

  if (Number(sets) <= 0 || Number(reps) <= 0) {
    throw new Error('sets y reps deben ser mayores a 0');
  }

  if (weight !== undefined && Number(weight) < 0) {
    throw new Error('weight no puede ser negativo');
  }

  const rirNorm = normalizeOptionalRir(rir);
  const rpeNorm = normalizeOptionalRpe(rpe);

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
    rir: rirNorm,
    rpe: rpeNorm,
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