const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'vitobry8',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME || 'smartgym',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 5432,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: false,
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err.message);
});

module.exports = pool;