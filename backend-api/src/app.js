const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// RUTAS
const authRoutes = require('./routes/auth.routes');
const workoutsRoutes = require('./routes/workouts.routes');
const userRoutes = require('./routes/user.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const goalRoutes = require('./routes/goal.routes');
const coachRoutes = require('./routes/coach.routes');
const trainerCoachRoutes = require('./routes/trainerCoach.routes');

// MIDDLEWARES
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API SmartGym Tracker funcionando correctamente',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servicio activo',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/me/coach', coachRoutes);
app.use('/api/trainer/clients', trainerCoachRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;