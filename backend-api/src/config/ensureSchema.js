/**
 * Alinea la BD con lo que espera el código (sin depender de psql manual).
 * Idempotente: seguro en cada arranque.
 */
async function ensureSchema(pool) {
  await pool.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS peso_corporal NUMERIC(6, 2)
  `);
  await pool.query(`
    ALTER TABLE workout_exercises
      ADD COLUMN IF NOT EXISTS rir SMALLINT NULL,
      ADD COLUMN IF NOT EXISTS rpe NUMERIC(3,1) NULL
  `);
}

module.exports = { ensureSchema };
