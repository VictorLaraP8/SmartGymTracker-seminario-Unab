import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const TOKEN_KEY = 'token';

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const registerRequest = async ({ name, email, password, role }) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    password,
    role: role ?? 'user',
  });

  if (!response.data?.data) {
    throw new Error(response.data?.message || 'No se pudo completar el registro');
  }

  return response.data.data;
};

export const loginRequest = async ({ email, password }) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  const token = response.data?.data?.token;

  if (!token) {
    throw new Error('No se recibió token desde el backend');
  }

  await saveToken(token);
  return token;
};

export const logoutRequest = async () => {
  await removeToken();
};
