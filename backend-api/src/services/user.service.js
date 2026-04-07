const pool = require('../config/db');

// 📌 Obtener estado de inactividad del usuario logeado
const getMyInactivityStatus = async (userId) => {
  const query = `
    SELECT MAX(created_at) AS last_workout_date
    FROM workouts
    WHERE user_id = $1
  `;

  const result = await pool.query(query, [userId]);

  const lastWorkoutDate = result.rows[0].last_workout_date;

  let daysWithoutTraining = 0;

  if (lastWorkoutDate) {
    const lastDate = new Date(lastWorkoutDate);
    const today = new Date();

    const diffTime = Math.abs(today - lastDate);
    daysWithoutTraining = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  // 🔥 Clasificación inteligente
  let status = 'active';

  if (daysWithoutTraining >= 8) {
    status = 'critical';
  } else if (daysWithoutTraining >= 3) {
    status = 'warning';
  }

  return {
    user_id: userId,
    last_workout_date: lastWorkoutDate,
    days_without_training: daysWithoutTraining,
    status,
  };
};

// 📌 Generar alertas para el usuario logeado
const getUserAlerts = async (userId) => {
  const inactivity = await getMyInactivityStatus(userId);

  let alerts = [];

  if (inactivity.days_without_training >= 3) {
    alerts.push('Usuario con baja adherencia');
  }

  if (inactivity.days_without_training >= 8) {
    alerts.push('Usuario en riesgo crítico de abandono');
  }

  return {
    inactivity,
    alerts,
  };
};

// 📌 Obtener usuarios en riesgo (panel entrenador)
const getUsersAtRisk = async () => {
  const query = `
    SELECT u.id, u.name, u.email,
           MAX(w.created_at) AS last_workout_date
    FROM users u
    LEFT JOIN workouts w ON u.id = w.user_id
    GROUP BY u.id
  `;

  const result = await pool.query(query);

  const users = result.rows;

  const processedUsers = users.map((user) => {
    let daysWithoutTraining = 0;

    if (user.last_workout_date) {
      const lastDate = new Date(user.last_workout_date);
      const today = new Date();

      const diffTime = Math.abs(today - lastDate);
      daysWithoutTraining = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    // 🔥 Clasificación inteligente
    let status = 'active';

    if (daysWithoutTraining >= 8) {
      status = 'critical';
    } else if (daysWithoutTraining >= 3) {
      status = 'warning';
    }

    // 🔥 Alertas
    let alerts = [];

    if (daysWithoutTraining >= 3) {
      alerts.push('Usuario con baja adherencia');
    }

    if (daysWithoutTraining >= 8) {
      alerts.push('Usuario en riesgo crítico de abandono');
    }

    return {
      user_id: user.id,
      name: user.name,
      email: user.email,
      last_workout_date: user.last_workout_date,
      days_without_training: daysWithoutTraining,
      status,
      alerts,
    };
  });

  // 🔥 SOLO usuarios en riesgo (warning + critical)
  return processedUsers.filter(
    (user) => user.status === 'warning' || user.status === 'critical'
  );
};

module.exports = {
  getMyInactivityStatus,
  getUserAlerts,
  getUsersAtRisk,
};