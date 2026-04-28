import axios from 'axios';
import Constants from 'expo-constants';
import { NativeModules, Platform } from 'react-native';

function normalizeApiBase(u) {
  const t = String(u).trim().replace(/\/+$/, '');
  return t.endsWith('/api') ? t : `${t}/api`;
}

/**
 * En desarrollo, el API suele estar en la misma máquina que Metro.
 * - iOS simulador: localhost / IP del Mac → OK.
 * - Android emulador: hay que usar 10.0.2.2 en lugar de localhost.
 * - iPhone físico: hace falta la IP LAN del Mac (sale del script del bundle o hostUri de Expo).
 */
function inferDevApiHost() {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^(?:https?|exp):\/\/(?:[^@]*@)?([^/:?]+)/i);
    if (match?.[1]) {
      let host = match[1];
      if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
        return '10.0.2.2';
      }
      return host;
    }
  }

  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = String(hostUri).split(':')[0];
    if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
      return '10.0.2.2';
    }
    if (host) {
      return host;
    }
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

function resolveBaseURL() {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (raw) {
    return normalizeApiBase(raw);
  }
  if (!__DEV__) {
    return 'http://localhost:4000/api';
  }
  const host = inferDevApiHost();
  return `http://${host}:4000/api`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isTimeout =
      error.code === 'ECONNABORTED' ||
      String(error.message || '').toLowerCase().includes('timeout');
    if (isTimeout) {
      error.message =
        'Sin respuesta del servidor. Arranca el backend (puerto 4000), revisa PostgreSQL y la red.';
    }
    return Promise.reject(error);
  }
);

export default api;
