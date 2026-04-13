require('dotenv').config();

const app = require('./app');
const pool = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    process.exit(1);
  }
};

startServer();