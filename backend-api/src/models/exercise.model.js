const pool = require('../config/db');

const createExercise = async ({ name, muscleGroup }) => {
    const query = `
    INSERT INTO exercises (name, muscle_group)
    VALUES ($1, $2)
    RETURNING id, name, muscle_group, created_at
    `;
    const values = [name, muscleGroup || null];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getAllExercises = async () => {
    const query = `
    SELECT id, name, muscle_group, created_at
    FROM exercises
    ORDER BY name ASC
    `;
   
    const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createExercise,
  getAllExercises,
};