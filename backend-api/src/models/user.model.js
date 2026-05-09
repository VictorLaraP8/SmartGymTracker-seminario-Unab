const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

const createUser = async ({ name, email, password, role }) => {
  const query = `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const values = [name, email, password, role];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllUsers = async () => {
  const query = `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY id ASC
  `;
  const result = await pool.query(query);
  return result.rows;
};

const findUserByIdSafe = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      role,
      created_at,
      edad,
      altura_cm,
      peso_corporal,
      objetivo,
      account_status
    FROM users
    WHERE id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const updateUserProfile = async (id, fields) => {
  const allowed = ['name', 'edad', 'altura_cm', 'peso_corporal', 'objetivo', 'account_status'];
  const sets = [];
  const values = [];
  let i = 1;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, key) && fields[key] !== undefined) {
      sets.push(`${key} = $${i}`);
      values.push(fields[key]);
      i += 1;
    }
  }

  if (sets.length === 0) {
    return findUserByIdSafe(id);
  }

  values.push(id);
  const query = `
    UPDATE users
    SET ${sets.join(', ')}
    WHERE id = $${i}
    RETURNING id, name, email, role, created_at, edad, altura_cm, peso_corporal, objetivo, account_status
  `;
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  findUserByIdSafe,
  updateUserProfile,
};
