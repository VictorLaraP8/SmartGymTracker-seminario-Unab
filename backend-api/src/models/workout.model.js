const pool = require('../config/db');

// CREATE
const createWorkout = async ({ userId, type, durationMinutes, workoutDate }) => {
  const query = `
    INSERT INTO workouts (user_id, type, duration_minutes, workout_date)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, type, duration_minutes, workout_date, created_at
  `;
  const values = [userId, type, durationMinutes, workoutDate];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// READ (todos los workouts del usuario)
const findWorkoutsByUser = async (userId) => {
  const query = `
    SELECT id, user_id, type, duration_minutes, workout_date, created_at
    FROM workouts
    WHERE user_id = $1
    ORDER BY workout_date DESC, created_at DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

// READ (un solo workout por id)
const findWorkoutById = async (id) => {
  const query = `
    SELECT * FROM workouts
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

// UPDATE
const updateWorkout = async ({ id, userId, type, durationMinutes, workoutDate }) => {
  const query = `
    UPDATE workouts
    SET type = $1,
        duration_minutes = $2,
        workout_date = $3
    WHERE id = $4 AND user_id = $5
    RETURNING id, user_id, type, duration_minutes, workout_date, created_at
  `;
  const values = [type, durationMinutes, workoutDate, id, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// DELETE
const deleteWorkout = async ({ id, userId }) => {
  const query = `
    DELETE FROM workouts
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

module.exports = {
  createWorkout,
  findWorkoutsByUser,
  findWorkoutById,
  updateWorkout,
  deleteWorkout,
};