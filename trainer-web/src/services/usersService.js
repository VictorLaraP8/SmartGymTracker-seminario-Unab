import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const mockHistoryByUser = {
  1: [
    { week: 'Sem 1', volume: 2400, sessions: 3 },
    { week: 'Sem 2', volume: 2900, sessions: 4 },
    { week: 'Sem 3', volume: 3100, sessions: 4 },
    { week: 'Sem 4', volume: 3250, sessions: 5 },
  ],
};

export async function getUsersAtRisk() {
  const response = await api.get('/users/at-risk');
  return response.data?.data || [];
}

export async function getUsersRanking() {
  const response = await api.get('/dashboard/ranking');
  return response.data?.data || [];
}

export function mergeClientsWithMetrics(clients, atRisk, ranking) {
  const atRiskMap = new Map(atRisk.map((entry) => [Number(entry.user_id), entry]));
  const rankingMap = new Map(ranking.map((entry) => [Number(entry.user_id), entry]));

  return clients.map((client) => {
    const id = Number(client.client_id);
    const riskData = atRiskMap.get(id);
    const scoreData = rankingMap.get(id);

    const adherence = scoreData?.components?.adherence ?? null;
    const daysWithoutTraining = riskData?.days_without_training ?? null;
    const inactivityStatus = riskData?.status || 'active';

    let adherenceStatus = 'activo';
    if (inactivityStatus === 'critical' || (daysWithoutTraining ?? 0) >= 8) {
      adherenceStatus = 'inactivo';
    } else if (inactivityStatus === 'warning' || (daysWithoutTraining ?? 0) >= 3) {
      adherenceStatus = 'en_riesgo';
    }

    return {
      id,
      name: client.client_name,
      email: client.client_email,
      assignedAt: client.created_at,
      lastWorkoutDate: riskData?.last_workout_date || null,
      daysWithoutTraining,
      inactivityStatus,
      alerts: riskData?.alerts || [],
      adherence,
      frequencyWeekly: adherence == null ? null : Math.round((adherence / 100) * 4),
      adherenceStatus,
      score: scoreData?.score ?? null,
      level: scoreData?.level ?? null,
      components: scoreData?.components || null,
    };
  });
}

export function getDashboardTotals(enrichedClients) {
  const totalUsers = enrichedClients.length;
  const activeUsers = enrichedClients.filter((client) => client.adherenceStatus === 'activo').length;
  const inactiveUsers = enrichedClients.filter((client) => client.adherenceStatus === 'inactivo').length;
  const adherenceValues = enrichedClients.map((client) => client.adherence).filter((value) => typeof value === 'number');
  const avgAdherence = adherenceValues.length
    ? Math.round(adherenceValues.reduce((acc, value) => acc + value, 0) / adherenceValues.length)
    : 0;

  const weeklySessionsKnown = enrichedClients
    .map((client) => client.frequencyWeekly)
    .filter((value) => typeof value === 'number');

  const weeklySessions = weeklySessionsKnown.length
    ? weeklySessionsKnown.reduce((acc, value) => acc + value, 0)
    : null;

  return { totalUsers, activeUsers, inactiveUsers, avgAdherence, weeklySessions };
}

/**
 * Backend gap:
 * No existe endpoint trainer para historial/progreso por clientId.
 * Si VITE_USE_MOCKS=true se usa historial simulado para la vista de detalle/progreso.
 */
export function getUserWeeklyHistory(userId) {
  if (!useMocks) {
    return [];
  }
  return mockHistoryByUser[userId] || [];
}
