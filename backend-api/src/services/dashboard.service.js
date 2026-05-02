const pool = require('../config/db');
const workoutModel = require('../models/workout.model');
const userModel = require('../models/user.model');
const goalModel = require('../models/goal.model');
const userService = require('./user.service');

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

const getMyDashboard = async (userId) => {
  const lastWorkout = await workoutModel.getLastWorkoutByUserId(userId);
  const goal = await goalModel.getGoalByUserId(userId);

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
  const adherence = await getMyAdherence(userId);

  let goalProgress = null;

  if (goal) {
    const volumeWeekQuery = `
      SELECT COALESCE(SUM(we.sets * we.reps * we.weight), 0) AS weekly_volume
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      WHERE w.user_id = $1
        AND COALESCE(w.workout_date, w.created_at) >= NOW() - INTERVAL '7 days'
    `;
    const volumeWeekResult = await pool.query(volumeWeekQuery, [userId]);
    const weeklyVolume = Number(volumeWeekResult.rows[0].weekly_volume);

    goalProgress = {
      weekly_sessions_goal: goal.weekly_sessions_goal,
      weekly_volume_goal: Number(goal.weekly_volume_goal),
      adherence_goal: goal.adherence_goal,
      current_weekly_sessions: adherence.weekly_sessions,
      current_weekly_volume: weeklyVolume,
      current_adherence: adherence.adherence_percentage,
      sessions_progress_percentage: Math.min(
        100,
        Math.round((adherence.weekly_sessions / goal.weekly_sessions_goal) * 100)
      ),
      volume_progress_percentage: Math.min(
        100,
        Math.round((weeklyVolume / Number(goal.weekly_volume_goal)) * 100)
      ),
      adherence_progress_percentage: Math.min(
        100,
        Math.round((adherence.adherence_percentage / goal.adherence_goal) * 100)
      ),
    };
  }

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
    goal: goal || null,
    goal_progress: goalProgress,
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

  if (dashboard.goal_progress) {
    if (dashboard.goal_progress.sessions_progress_percentage < 50) {
      recommendations.push({
        type: 'goal_sessions',
        title: 'Acércate a tu meta semanal',
        message:
          'Tu avance de sesiones semanales aún es bajo respecto a tu objetivo. Intenta aumentar la frecuencia.',
        priority: 'high',
      });
    }

    if (dashboard.goal_progress.volume_progress_percentage < 50) {
      recommendations.push({
        type: 'goal_volume',
        title: 'Incrementa tu volumen semanal',
        message:
          'Tu volumen semanal está por debajo de tu meta. Puedes aumentar carga, series o repeticiones.',
        priority: 'medium',
      });
    }
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

const getMyMissions = async (userId) => {
  const dashboard = await getMyDashboard(userId);
  const missions = [];

  if (!dashboard.goal || !dashboard.goal_progress) {
    missions.push({
      id: 'start-goal',
      title: 'Define tu meta semanal',
      description: 'Crea una meta para comenzar a medir tu progreso de forma inteligente.',
      completed: false,
      progress_percentage: 0,
      reward: 'Base del plan activada',
    });

    return {
      user_id: userId,
      missions,
    };
  }

  missions.push({
    id: 'weekly-sessions',
    title: `Completa ${dashboard.goal.weekly_sessions_goal} sesiones esta semana`,
    description: `Llevas ${dashboard.goal_progress.current_weekly_sessions} de ${dashboard.goal.weekly_sessions_goal} sesiones.`,
    completed:
      dashboard.goal_progress.current_weekly_sessions >=
      dashboard.goal.weekly_sessions_goal,
    progress_percentage: dashboard.goal_progress.sessions_progress_percentage,
    reward: 'Constancia semanal',
  });

  missions.push({
    id: 'weekly-volume',
    title: `Alcanza ${Number(dashboard.goal.weekly_volume_goal)} de volumen semanal`,
    description: `Llevas ${dashboard.goal_progress.current_weekly_volume} de ${Number(
      dashboard.goal.weekly_volume_goal
    )}.`,
    completed:
      dashboard.goal_progress.current_weekly_volume >=
      Number(dashboard.goal.weekly_volume_goal),
    progress_percentage: dashboard.goal_progress.volume_progress_percentage,
    reward: 'Impulso de rendimiento',
  });

  missions.push({
    id: 'weekly-adherence',
    title: `Mantén adherencia de ${dashboard.goal.adherence_goal}%`,
    description: `Tu adherencia actual es ${dashboard.goal_progress.current_adherence}%.`,
    completed:
      dashboard.goal_progress.current_adherence >= dashboard.goal.adherence_goal,
    progress_percentage: dashboard.goal_progress.adherence_progress_percentage,
    reward: 'Disciplina activa',
  });

  return {
    user_id: userId,
    missions,
  };
};

const getMyAchievements = async (userId) => {
  const dashboard = await getMyDashboard(userId);
  const adherence = await getMyAdherence(userId);

  const achievements = [];

  achievements.push({
    id: 'first-workout',
    title: 'Primer entrenamiento',
    description: 'Registra tu primer entrenamiento',
    unlocked: !!dashboard.last_workout,
  });

  achievements.push({
    id: 'volume-1000',
    title: 'Volumen 1000+',
    description: 'Supera 1000 de volumen en una sesión',
    unlocked: dashboard.metrics.total_volume >= 1000,
  });

  achievements.push({
    id: '3-sessions-week',
    title: '3 sesiones semanales',
    description: 'Completa 3 entrenamientos en 7 días',
    unlocked: adherence.weekly_sessions >= 3,
  });

  achievements.push({
    id: 'high-adherence',
    title: 'Alta adherencia',
    description: 'Mantén adherencia sobre 75%',
    unlocked: adherence.adherence_percentage >= 75,
  });

  if (dashboard.goal_progress) {
    achievements.push({
      id: 'goal-completed',
      title: 'Meta semanal cumplida',
      description: 'Cumple todos tus objetivos semanales',
      unlocked:
        dashboard.goal_progress.sessions_progress_percentage >= 100 &&
        dashboard.goal_progress.volume_progress_percentage >= 100,
    });
  }

  return {
    user_id: userId,
    achievements,
  };
};

module.exports = {
  getMyDashboard,
  getMyRecommendations,
  getMyAdherence,
  getUserScore,
  getUsersRanking,
  getMyMissions,
  getMyAchievements,
};