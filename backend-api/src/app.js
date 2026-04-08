const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// RUTAS
const authRoutes = require('./routes/auth.routes');
const workoutsRoutes = require('./routes/workouts.routes');
const userRoutes = require('./routes/user.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// MIDDLEWARES
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// MIDDLEWARES BASE
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// RUTA BASE
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API SmartGym Tracker funcionando correctamente',
  });
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servicio activo',
  });
});

// RUTAS PRINCIPALES
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// MIDDLEWARES DE ERROR
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;