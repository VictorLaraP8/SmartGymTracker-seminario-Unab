import api from './api';
import { getToken } from './auth';

const buildHeaders = async () => {
  const token = await getToken();

  if (!token) {
    throw new Error('No hay sesión activa');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getExercisesRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/exercises', { headers });
  return response.data;
};

export const createWorkoutRequest = async ({
  type,
  durationMinutes,
  workoutDate,
}) => {
  const headers = await buildHeaders();

  const response = await api.post(
    '/workouts',
    {
      type,
      durationMinutes,
      workoutDate,
    },
    { headers }
  );

  return response.data;
};

export const addExerciseToWorkoutRequest = async ({
  workoutId,
  exerciseId,
  sets,
  reps,
  weight,
}) => {
  const headers = await buildHeaders();

  const response = await api.post(
    `/workouts/${workoutId}/exercises`,
    {
      exerciseId,
      sets,
      reps,
      weight,
    },
    { headers }
  );

  return response.data;
};

export const createWorkoutWithExerciseRequest = async ({
  type,
  durationMinutes,
  workoutDate,
  exerciseId,
  sets,
  reps,
  weight,
}) => {
  const workoutResponse = await createWorkoutRequest({
    type,
    durationMinutes,
    workoutDate,
  });

  const workoutId = workoutResponse?.data?.id;

  if (!workoutId) {
    throw new Error('No se pudo obtener el ID del workout creado');
  }

  const exerciseResponse = await addExerciseToWorkoutRequest({
    workoutId,
    exerciseId,
    sets,
    reps,
    weight,
  });

  return {
    workout: workoutResponse,
    exercise: exerciseResponse,
  };
};

export const getWorkoutHistoryRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/workouts/history', { headers });
  return response.data;
};