const pool = require('../config/db');
const workoutModel = require('../models/workout.model');

const createWorkout = async ({ userId, type, durationMinutes, workoutDate }) => {
  if (!type || !durationMinutes || !workoutDate) {
    throw new Error('Todos los campos son obligatorios');
  }

  return await workoutModel.createWorkout({
    userId,
    type,
    durationMinutes,
    workoutDate,
  });
};

const getWorkouts = async (userId) => {
  return await workoutModel.findWorkoutsByUser(userId);
};

const updateWorkout = async ({ id, userId, type, durationMinutes, workoutDate }) => {
  if (!type || !durationMinutes || !workoutDate) {
    throw new Error('Todos los campos son obligatorios');
  }

  const updatedWorkout = await workoutModel.updateWorkout({
    id,
    userId,
    type,
    durationMinutes,
    workoutDate,
  });

  if (!updatedWorkout) {
    throw new Error('Workout no encontrado o no autorizado');
  }

  return updatedWorkout;
};

const deleteWorkout = async (id, userId) => {
  const deletedWorkout = await workoutModel.deleteWorkout({ id, userId });

  if (!deletedWorkout) {
    throw new Error('Workout no encontrado o no autorizado');
  }

  return deletedWorkout;
};

const getWorkoutHistory = async (userId) => {
  const query = `
    SELECT
      w.id,
      w.type,
      w.duration_minutes,
      w.workout_date,
      w.created_at,
      COUNT(DISTINCT we.exercise_id) AS total_exercises,
      COALESCE(SUM(we.sets), 0) AS total_sets,
      COALESCE(SUM(we.reps), 0) AS total_reps,
      COALESCE(SUM(we.sets * we.reps * we.weight), 0) AS total_volume
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    WHERE w.user_id = $1
    GROUP BY w.id
    ORDER BY w.workout_date DESC, w.created_at DESC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map((workout) => ({
    ...workout,
    total_exercises: Number(workout.total_exercises),
    total_sets: Number(workout.total_sets),
    total_reps: Number(workout.total_reps),
    total_volume: Number(workout.total_volume),
  }));
};

const getWorkoutProgress = async (userId) => {
  const query = `
    SELECT
      DATE(w.workout_date) AS date,
      COALESCE(SUM(we.sets * we.reps * we.weight), 0) AS total_volume
    FROM workouts w
    LEFT JOIN workout_exercises we ON w.id = we.workout_id
    WHERE w.user_id = $1
    GROUP BY DATE(w.workout_date)
    ORDER BY DATE(w.workout_date) ASC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map((row) => ({
    date: row.date,
    total_volume: Number(row.total_volume),
  }));
};

module.exports = {
  createWorkout,
  getWorkouts,
  updateWorkout,
  deleteWorkout,
  getWorkoutHistory,
  getWorkoutProgress,
};