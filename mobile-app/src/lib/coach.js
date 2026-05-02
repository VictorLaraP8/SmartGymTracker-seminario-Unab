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

export const getCoachSummaryRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/me/coach', { headers });
  return response.data;
};

export const getCoachMessagesRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/me/coach/messages', { headers });
  return response.data;
};

export const postCoachMessageRequest = async (body) => {
  const headers = await buildHeaders();
  const response = await api.post(
    '/me/coach/messages',
    { body },
    { headers }
  );
  return response.data;
};

export const getCoachRecommendationsRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/me/coach/recommendations', { headers });
  return response.data;
};

export const patchCoachRecommendationReadRequest = async (id) => {
  const headers = await buildHeaders();
  const response = await api.patch(`/me/coach/recommendations/${id}/read`, {}, { headers });
  return response.data;
};
