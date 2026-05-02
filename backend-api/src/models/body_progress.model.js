const pool = require('../config/db');

const listByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, fecha, peso_corporal, porcentaje_grasa, masa_muscular, imc, observacion, created_at
    FROM body_progress
    WHERE user_id = $1
    ORDER BY fecha DESC, id DESC
  `;
  const result = await pool.query(query, [userId]);
  return result.rows;
};

const upsertProgress = async (
  userId,
  { fecha, peso_corporal, porcentaje_grasa, masa_muscular, imc, observacion }
) => {
  const query = `
    INSERT INTO body_progress (user_id, fecha, peso_corporal, porcentaje_grasa, masa_muscular, imc, observacion)
    VALUES ($1, $2::date, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, fecha) DO UPDATE SET
      peso_corporal = EXCLUDED.peso_corporal,
      porcentaje_grasa = EXCLUDED.porcentaje_grasa,
      masa_muscular = EXCLUDED.masa_muscular,
      imc = EXCLUDED.imc,
      observacion = EXCLUDED.observacion
    RETURNING id, user_id, fecha, peso_corporal, porcentaje_grasa, masa_muscular, imc, observacion, created_at
  `;
  const values = [
    userId,
    fecha,
    peso_corporal ?? null,
    porcentaje_grasa ?? null,
    masa_muscular ?? null,
    imc ?? null,
    observacion ?? null,
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  listByUserId,
  upsertProgress,
};
