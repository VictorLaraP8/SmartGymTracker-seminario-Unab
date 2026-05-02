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

export const getProfileRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/users/me', { headers });
  return response.data;
};

export const patchProfileRequest = async (body) => {
  const headers = await buildHeaders();
  const response = await api.patch('/users/me', body, { headers });
  return response.data;
};

export const getBodyProgressRequest = async () => {
  const headers = await buildHeaders();
  const response = await api.get('/users/me/progress', { headers });
  return response.data;
};

export const postBodyProgressRequest = async (body) => {
  const headers = await buildHeaders();
  const response = await api.post('/users/me/progress', body, { headers });
  return response.data;
};
