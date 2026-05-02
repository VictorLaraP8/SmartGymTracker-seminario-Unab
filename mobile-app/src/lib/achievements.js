export const calculateAchievements = (workouts = [], streak = 0) => {
  const achievements = [];

  if (!Array.isArray(workouts)) {
    return achievements;
  }

  const totalWorkouts = workouts.length;

  const totalVolume = workouts.reduce((acc, workout) => {
    return acc + Number(workout.total_volume || 0);
  }, 0);

  if (totalWorkouts >= 1) {
    achievements.push({
      id: 'first-workout',
      icon: '🥇',
      title: 'Primer paso',
      description: 'Completaste tu primer entrenamiento',
    });
  }

  if (totalWorkouts >= 10) {
    achievements.push({
      id: 'ten-workouts',
      icon: '💯',
      title: 'Constante',
      description: 'Has completado 10 entrenamientos',
    });
  }

  if (streak >= 3) {
    achievements.push({
      id: 'three-day-streak',
      icon: '🔥',
      title: 'En racha',
      description: 'Entrenaste 3 días seguidos',
    });
  }

  if (totalVolume >= 10000) {
    achievements.push({
      id: 'high-volume',
      icon: '🏆',
      title: 'Volumen alto',
      description: 'Superaste 10.000 de volumen total',
    });
  }

  return achievements;
};