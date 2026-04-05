const pool = require('../config/db');

const addExerciseToWorkout = async ({ workoutId, exerciseId, sets, reps, weight }) => {
  const query = `
    INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, workout_id, exercise_id, sets, reps, weight, created_at
  `;
  const values = [workoutId, exerciseId, sets, reps, weight || 0];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getExercisesByWorkoutId = async (workoutId) => {
  const query = `
    SELECT 
      we.id,
      we.workout_id,
      we.exercise_id,
      e.name AS exercise_name,
      e.muscle_group,
      we.sets,
      we.reps,
      we.weight,
      we.created_at
    FROM workout_exercises we
    INNER JOIN exercises e ON we.exercise_id = e.id
    WHERE we.workout_id = $1
    ORDER BY we.created_at ASC
  `;
  const result = await pool.query(query, [workoutId]);
  return result.rows;
};

const getWorkoutMetrics = async (workoutId) => {
  const query = `
    SELECT
      COUNT(DISTINCT we.exercise_id) AS total_exercises,
      COALESCE(SUM(we.sets), 0) AS total_sets,
      COALESCE(SUM(we.reps), 0) AS total_reps,
      COALESCE(SUM(we.sets * we.reps * we.weight), 0) AS total_volume
    FROM workout_exercises we
    WHERE we.workout_id = $1
  `;
  const result = await pool.query(query, [workoutId]);
  return result.rows[0];
};

module.exports = {
  addExerciseToWorkout,
  getExercisesByWorkoutId,
  getWorkoutMetrics,
};