const pool = require('../config/db');
const workoutModel = require('../models/workout.model');
const userModel = require('../models/user.model');
const userService = require('./user.service');

const getMyDashboard = async (userId) => {
  const lastWorkout = await workoutModel.getLastWorkoutByUserId(userId);

  let metrics = {
    total_exercises: 0,
    total_sets: 0,
    total_reps: 0,
    total_volume: 0,
  };

  if (lastWorkout) {
    const metricsQuery = `
      SELECT
        COUNT(DISTINCT we.exercise_id) AS total_exercises,
        COALESCE(SUM(we.sets), 0) AS total_sets,
        COALESCE(SUM(we.reps), 0) AS total_reps,
        COALESCE(SUM(we.sets * we.reps * we.weight), 0) AS total_volume
      FROM workout_exercises we
      WHERE we.workout_id = $1
    `;

    const metricsResult = await pool.query(metricsQuery, [lastWorkout.id]);

    metrics = {
      total_exercises: Number(metricsResult.rows[0].total_exercises),
      total_sets: Number(metricsResult.rows[0].total_sets),
      total_reps: Number(metricsResult.rows[0].total_reps),
      total_volume: Number(metricsResult.rows[0].total_volume),
    };
  }

  const inactivity = await userService.getMyInactivityStatus(userId);
  const alertsData = await userService.getUserAlerts(userId);

  return {
    user_id: userId,
    last_workout: lastWorkout
      ? {
          id: lastWorkout.id,
          type: lastWorkout.type,
          duration_minutes: lastWorkout.duration_minutes,
          workout_date: lastWorkout.workout_date,
          created_at: lastWorkout.created_at,
        }
      : null,
    metrics,
    inactivity: {
      last_workout_date: inactivity.last_workout_date,
      days_without_training: inactivity.days_without_training,
      status: inactivity.status,
    },
    alerts: alertsData.alerts,
  };
};

const getMyRecommendations = async (userId) => {
  const dashboard = await getMyDashboard(userId);

  const recommendations = [];

  if (!dashboard.last_workout) {
    recommendations.push({
      type: 'start',
      title: 'Comienza tu primer entrenamiento',
      message:
        'Aún no registras entrenamientos. Empieza con una rutina básica para generar historial y medir progreso.',
      priority: 'high',
    });

    return {
      user_id: userId,
      last_workout: null,
      metrics: dashboard.metrics,
      inactivity: dashboard.inactivity,
      recommendations,
    };
  }

  if (dashboard.inactivity.status === 'warning') {
    recommendations.push({
      type: 'frequency',
      title: 'Retoma tu frecuencia',
      message:
        'Llevas varios días sin entrenar. Intenta retomar tu rutina esta semana para mantener la adherencia.',
      priority: 'high',
    });
  }

  if (dashboard.inactivity.status === 'critical') {
    recommendations.push({
      type: 'adherence',
      title: 'Riesgo de abandono',
      message:
        'Tu nivel de inactividad es alto. Se recomienda reiniciar progresivamente con sesiones cortas y frecuentes.',
      priority: 'high',
    });
  }

  if (dashboard.metrics.total_volume > 0 && dashboard.metrics.total_volume < 1000) {
    recommendations.push({
      type: 'volume',
      title: 'Aumenta el volumen',
      message:
        'Tu volumen total fue bajo. Podrías aumentar series, repeticiones o carga de forma progresiva.',
      priority: 'medium',
    });
  }

  if (dashboard.metrics.total_exercises > 0 && dashboard.metrics.total_exercises < 2) {
    recommendations.push({
      type: 'variety',
      title: 'Agrega más variedad',
      message:
        'Tu entrenamiento tuvo pocos ejercicios. Puedes incorporar más variedad para estimular mejor el progreso.',
      priority: 'low',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'positive',
      title: 'Vas por buen camino',
      message:
        'Tu nivel de actividad y entrenamiento es adecuado. Mantén la constancia para seguir progresando.',
      priority: 'low',
    });
  }

  return {
    user_id: userId,
    last_workout: dashboard.last_workout,
    metrics: dashboard.metrics,
    inactivity: dashboard.inactivity,
    recommendations,
  };
};

const getMyAdherence = async (userId) => {
  const recommendedSessions = 4;

  const query = `
    SELECT COUNT(*) AS weekly_sessions
    FROM workouts
    WHERE user_id = $1
      AND COALESCE(workout_date, created_at) >= NOW() - INTERVAL '7 days'
  `;

  const result = await pool.query(query, [userId]);
  const weeklySessions = Number(result.rows[0].weekly_sessions);

  const adherencePercentage = Math.min(
    100,
    Math.round((weeklySessions / recommendedSessions) * 100)
  );

  let status = 'low';

  if (adherencePercentage >= 75) {
    status = 'high';
  } else if (adherencePercentage >= 50) {
    status = 'medium';
  }

  return {
    user_id: userId,
    weekly_sessions: weeklySessions,
    recommended_sessions: recommendedSessions,
    adherence_percentage: adherencePercentage,
    status,
  };
};

const getUserScore = async (userId) => {
  const adherence = await getMyAdherence(userId);
  const inactivity = await userService.getMyInactivityStatus(userId);
  const dashboard = await getMyDashboard(userId);

  const adherenceScore = adherence.adherence_percentage;

  let activityScore = 0;
  if (dashboard.metrics.total_volume > 2000) {
    activityScore = 100;
  } else if (dashboard.metrics.total_volume > 1000) {
    activityScore = 70;
  } else if (dashboard.metrics.total_volume > 0) {
    activityScore = 40;
  }

  let consistencyScore = 0;
  if (inactivity.status === 'active') {
    consistencyScore = 100;
  } else if (inactivity.status === 'warning') {
    consistencyScore = 60;
  } else if (inactivity.status === 'critical') {
    consistencyScore = 20;
  }

  const finalScore = Math.round(
    adherenceScore * 0.4 +
      activityScore * 0.3 +
      consistencyScore * 0.3
  );

  let level = 'beginner';
  if (finalScore >= 80) {
    level = 'advanced';
  } else if (finalScore >= 50) {
    level = 'intermediate';
  }

  return {
    user_id: userId,
    score: finalScore,
    level,
    components: {
      adherence: adherenceScore,
      activity: activityScore,
      consistency: consistencyScore,
    },
  };
};

const getUsersRanking = async () => {
  const users = await userModel.getAllUsers();
  const ranking = [];

  for (const user of users) {
    const scoreData = await getUserScore(user.id);

    ranking.push({
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      score: scoreData.score,
      level: scoreData.level,
      components: scoreData.components,
    });
  }

  ranking.sort((a, b) => b.score - a.score);

  return ranking;
};

module.exports = {
  getMyDashboard,
  getMyRecommendations,
  getMyAdherence,
  getUserScore,
  getUsersRanking,
};