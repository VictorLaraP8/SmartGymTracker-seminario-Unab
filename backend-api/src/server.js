require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');
const { ensureSchema } = require('./config/ensureSchema');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa');
    await ensureSchema(pool);
    console.log('✅ Esquema de BD verificado (users.peso_corporal, workout_exercises rir/rpe)');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
};

startServer();