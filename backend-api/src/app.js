const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const workoutsRoutes = require('./routes/workouts.routes');
const userRoutes = require('./routes/user.routes');

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

module.exports = app;