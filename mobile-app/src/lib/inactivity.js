export const calculateInactivityAlert = (workouts = []) => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return {
        daysWithoutTraining: null,
        level: 'initial',
        title: 'Aún no registras entrenamientos',
        message: 'Comienza hoy para activar tu seguimiento y calcular tu adherencia.',
      };
    }
  
    const sortedWorkouts = [...workouts].sort((a, b) => {
      const dateA = new Date(a.workout_date || 0).getTime();
      const dateB = new Date(b.workout_date || 0).getTime();
      return dateB - dateA;
    });
  
    const lastWorkoutDateValue = sortedWorkouts[0]?.workout_date;
  
    if (!lastWorkoutDateValue) {
      return {
        daysWithoutTraining: null,
        level: 'initial',
        title: 'No hay fecha válida de entrenamiento',
        message: 'Registra un entrenamiento para activar la alerta de inactividad.',
      };
    }
  
    const now = new Date();
    const lastWorkoutDate = new Date(lastWorkoutDateValue);
  
    const msPerDay = 1000 * 60 * 60 * 24;
    const rawDifference = now.getTime() - lastWorkoutDate.getTime();
    const daysWithoutTraining = Math.floor(rawDifference / msPerDay);
  
    if (daysWithoutTraining <= 2) {
      return {
        daysWithoutTraining,
        level: 'ok',
        title: 'Buen ritmo',
        message: `Llevas ${daysWithoutTraining} día(s) sin entrenar. Mantén la constancia.`,
      };
    }
  
    if (daysWithoutTraining <= 4) {
      return {
        daysWithoutTraining,
        level: 'warning',
        title: 'Atención a tu constancia',
        message: `Llevas ${daysWithoutTraining} día(s) sin entrenar. Te conviene retomar pronto.`,
      };
    }
  
    return {
      daysWithoutTraining,
      level: 'danger',
      title: 'Alerta de inactividad',
      message: `Llevas ${daysWithoutTraining} día(s) sin entrenar. Registra una sesión para no perder adherencia.`,
    };
  };