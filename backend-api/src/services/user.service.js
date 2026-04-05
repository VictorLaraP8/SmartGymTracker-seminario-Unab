const workoutModel = require('../models/workout.model');

const getMyInactivityStatus = async (userId) => {
  const lastWorkout = await workoutModel.getLastWorkoutByUserId(userId);

  if (!lastWorkout) {
    return {
      user_id: userId,
      last_workout_date: null,
      days_without_training: null,
      status: 'no_data',
    };
  }

  const today = new Date();
  const workoutDate = new Date(
    lastWorkout.workout_date || lastWorkout.created_at
  );

  const diffMs = today - workoutDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let status = 'active';

  if (diffDays >= 7) {
    status = 'inactive';
  } else if (diffDays >= 3) {
    status = 'warning';
  }

  return {
    user_id: userId,
    last_workout_date: workoutDate,
    days_without_training: diffDays,
    status,
  };
};

const getUserAlerts = async (userId) => {
  const inactivity = await getMyInactivityStatus(userId);

  const alerts = [];

  if (inactivity.status === 'warning') {
    alerts.push({
      type: 'warning',
      message: 'Llevas varios días sin entrenar, ¡retoma tu rutina!',
    });
  }

  if (inactivity.status === 'inactive') {
    alerts.push({
      type: 'danger',
      message: 'Has estado inactivo más de 7 días',
    });
  }

  if (inactivity.status === 'no_data') {
    alerts.push({
      type: 'info',
      message: 'Aún no has registrado entrenamientos',
    });
  }

  return {
    inactivity,
    alerts,
  };
};

module.exports = {
  getMyInactivityStatus,
  getUserAlerts,
};