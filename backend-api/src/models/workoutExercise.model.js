const pool = require('../config/db');

// Crear relación entre workout y ejercicio
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

// Obtener ejercicios de un workout
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

module.exports = {
  addExerciseToWorkout,
  getExercisesByWorkoutId,
};