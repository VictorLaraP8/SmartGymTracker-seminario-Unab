import api from './api';

export async function getTrainerClients() {
  const response = await api.get('/trainer/clients');
  return response.data?.data || [];
}

export async function assignClientByEmail(clientEmail) {
  const response = await api.post('/trainer/clients', { clientEmail });
  return response.data?.data;
}

export async function getClientMessages(clientId) {
  const response = await api.get(`/trainer/clients/${clientId}/messages`);
  return response.data?.data || [];
}

export async function getClientRecommendations(clientId) {
  const response = await api.get(`/trainer/clients/${clientId}/recommendations`);
  return response.data?.data || [];
}

export async function sendClientMessage(clientId, body) {
  const response = await api.post(`/trainer/clients/${clientId}/messages`, { body });
  return response.data?.data;
}

export async function sendClientRecommendation(clientId, title, body) {
  const response = await api.post(`/trainer/clients/${clientId}/recommendations`, { title, body });
  return response.data?.data;
}
