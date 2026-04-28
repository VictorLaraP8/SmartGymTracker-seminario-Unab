export const calculateDashboardMetrics = (workouts = [], weeklyGoal = 5) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return {
      weeklyFrequency: 0,
      totalVolume: 0,
      calculatedAdherence: 0,
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const weeklyWorkouts = workouts.filter((workout) => {
    if (!workout.workout_date) return false;

    const workoutDate = new Date(workout.workout_date);

    return workoutDate >= sevenDaysAgo && workoutDate <= now;
  });

  const uniqueDays = new Set(
    weeklyWorkouts.map((workout) => {
      const date = new Date(workout.workout_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  );

  const weeklyFrequency = uniqueDays.size;

  const totalVolume = workouts.reduce((acc, workout) => {
    return acc + Number(workout.total_volume || 0);
  }, 0);

  let calculatedAdherence = Math.round((weeklyFrequency / weeklyGoal) * 100);

  if (calculatedAdherence > 100) {
    calculatedAdherence = 100;
  }

  return {
    weeklyFrequency,
    totalVolume,
    calculatedAdherence,
  };
};

export const getVolumeChartData = (workouts = []) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return {
      labels: [],
      data: [],
    };
  }

  const volumeByDate = {};

  workouts.forEach((workout) => {
    if (!workout.workout_date) return;

    const date = new Date(workout.workout_date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const key = `${year}-${month}-${day}`;

    if (!volumeByDate[key]) {
      volumeByDate[key] = 0;
    }

    volumeByDate[key] += Number(workout.total_volume || 0);
  });

  const sortedDates = Object.keys(volumeByDate).sort();

  return {
    labels: sortedDates.map((date) => date.slice(5)),
    data: sortedDates.map((date) => volumeByDate[date]),
  };
};

export const calculateStreak = (workouts = []) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return 0;
  }

  const uniqueDays = [
    ...new Set(
      workouts
        .filter((workout) => workout.workout_date)
        .map((workout) => {
          const date = new Date(workout.workout_date);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })
    ),
  ];

  if (uniqueDays.length === 0) {
    return 0;
  }

  const sortedDays = uniqueDays.sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(
    yesterday.getMonth() + 1
  ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const firstDay = sortedDays[0];

  if (firstDay !== todayKey && firstDay !== yesterdayKey) {
    return 0;
  }

  let streak = 1;
  let previousDate = new Date(firstDay);

  for (let i = 1; i < sortedDays.length; i += 1) {
    const currentDate = new Date(sortedDays[i]);
    const differenceInDays = Math.round(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (differenceInDays === 1) {
      streak += 1;
      previousDate = currentDate;
    } else if (differenceInDays === 0) {
      continue;
    } else {
      break;
    }
  }

  return streak;
};

export const calculateWeeklyGoalProgress = (workouts = [], weeklyGoal = 4) => {
  if (!Array.isArray(workouts) || workouts.length === 0) {
    return {
      completed: 0,
      goal: weeklyGoal,
      percentage: 0,
    };
  }

  const now = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const weeklyWorkouts = workouts.filter((workout) => {
    if (!workout.workout_date) return false;

    const workoutDate = new Date(workout.workout_date);
    return workoutDate >= sevenDaysAgo && workoutDate <= now;
  });

  const uniqueDays = new Set(
    weeklyWorkouts.map((workout) => {
      const date = new Date(workout.workout_date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
  );

  const completed = uniqueDays.size;

  let percentage = Math.round((completed / weeklyGoal) * 100);

  if (percentage > 100) {
    percentage = 100;
  }

  return {
    completed,
    goal: weeklyGoal,
    percentage,
  };
};