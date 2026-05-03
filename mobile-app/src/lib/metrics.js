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

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const buildVolumeByDate = (workouts) => {
  const map = {};

  workouts.forEach((workout) => {
    if (!workout.workout_date) return;

    const key = dateKey(new Date(workout.workout_date));

    if (!map[key]) {
      map[key] = 0;
    }

    map[key] += Number(workout.total_volume || 0);
  });

  return map;
};

const sumRange = (volumeByDate, start, length) => {
  let total = 0;

  for (let i = 0; i < length; i += 1) {
    const key = dateKey(addDays(start, i));
    total += volumeByDate[key] || 0;
  }

  return total;
};

const formatDayLabel = (date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const buildSummary = ({ data, labels, prevTotal, unit }) => {
  const total = data.reduce((acc, value) => acc + value, 0);
  const sessions = data.filter((value) => value > 0).length;
  const average = sessions > 0 ? Math.round(total / sessions) : 0;

  let peakIndex = -1;
  let peakValue = 0;

  data.forEach((value, index) => {
    if (value > peakValue) {
      peakValue = value;
      peakIndex = index;
    }
  });

  const peak =
    peakIndex >= 0
      ? { value: peakValue, index: peakIndex, label: labels[peakIndex] }
      : { value: 0, index: -1, label: '' };

  let deltaPct = null;

  if (prevTotal > 0) {
    deltaPct = Math.round(((total - prevTotal) / prevTotal) * 100);
  } else if (prevTotal === 0 && total > 0) {
    deltaPct = 100;
  }

  return {
    total,
    prevTotal,
    deltaPct,
    peak,
    average,
    sessions,
    unit,
  };
};

const buildWeeklyChart = (workouts) => {
  const volumeByDate = buildVolumeByDate(workouts);
  const today = startOfDay(new Date());
  const start = addDays(today, -6);
  const prevStart = addDays(start, -7);

  const labels = [];
  const data = [];

  for (let i = 0; i < 7; i += 1) {
    const day = addDays(start, i);
    labels.push(formatDayLabel(day));
    data.push(volumeByDate[dateKey(day)] || 0);
  }

  const prevTotal = sumRange(volumeByDate, prevStart, 7);

  return {
    labels,
    data,
    range: 'weekly',
    ...buildSummary({ data, labels, prevTotal, unit: 'kg' }),
  };
};

const startOfIsoWeek = (date) => {
  const day = startOfDay(date);
  const weekday = day.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  return addDays(day, diff);
};

const buildMonthlyChart = (workouts) => {
  const volumeByDate = buildVolumeByDate(workouts);
  const currentWeekStart = startOfIsoWeek(new Date());
  const start = addDays(currentWeekStart, -7 * 4);
  const prevStart = addDays(start, -7 * 5);

  const labels = [];
  const data = [];

  for (let i = 0; i < 5; i += 1) {
    const weekStart = addDays(start, i * 7);
    labels.push(formatDayLabel(weekStart));
    data.push(sumRange(volumeByDate, weekStart, 7));
  }

  const prevTotal = sumRange(volumeByDate, prevStart, 7 * 5);

  return {
    labels,
    data,
    range: 'monthly',
    ...buildSummary({ data, labels, prevTotal, unit: 'kg' }),
  };
};

export const getVolumeChartData = (workouts = [], range = 'weekly') => {
  const safeWorkouts = Array.isArray(workouts) ? workouts : [];

  if (range === 'monthly') {
    return buildMonthlyChart(safeWorkouts);
  }

  return buildWeeklyChart(safeWorkouts);
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