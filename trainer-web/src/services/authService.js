import api from './api';

export async function loginTrainer(credentials) {
  const response = await api.post('/auth/login', credentials);
  const payload = response.data?.data || {};

  return {
    token: payload.token,
    user: payload.user,
    message: response.data?.message || 'Login exitoso',
  };
}
