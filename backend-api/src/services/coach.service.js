const coachModel = require('../models/coach.model');

const getCoachSummaryForClient = async (clientId) => {
  const assignment = await coachModel.findActiveAssignmentForClient(clientId);

  if (!assignment) {
    return {
      coach: null,
      unreadMessagesFromCoach: 0,
      unreadRecommendations: 0,
    };
  }

  const trainerId = assignment.trainer_id;
  const [unreadMessagesFromCoach, unreadRecommendations] = await Promise.all([
    coachModel.countUnreadMessagesForRecipient(clientId, trainerId),
    coachModel.countUnreadRecommendationsForClient(clientId),
  ]);

  return {
    coach: {
      id: assignment.trainer_user_id,
      name: assignment.trainer_name,
      email: assignment.trainer_email,
    },
    assignmentId: assignment.assignment_id,
    unreadMessagesFromCoach,
    unreadRecommendations,
  };
};

const getMessagesForClient = async (clientId) => {
  const assignment = await coachModel.findActiveAssignmentForClient(clientId);

  if (!assignment) {
    throw new Error('No tienes un entrenador asignado');
  }

  const trainerId = assignment.trainer_id;
  await coachModel.markMessagesReadForPair(clientId, trainerId);
  const messages = await coachModel.listConversationMessages(clientId, trainerId);

  return messages;
};

const postMessageFromClient = async (clientId, body) => {
  const trimmed = String(body || '').trim();

  if (!trimmed) {
    throw new Error('El mensaje no puede estar vacío');
  }

  if (trimmed.length > 8000) {
    throw new Error('El mensaje es demasiado largo');
  }

  const assignment = await coachModel.findActiveAssignmentForClient(clientId);

  if (!assignment) {
    throw new Error('No tienes un entrenador asignado');
  }

  return await coachModel.insertMessage({
    senderId: clientId,
    recipientId: assignment.trainer_id,
    body: trimmed,
  });
};

const getRecommendationsForClient = async (clientId) => {
  return await coachModel.listRecommendationsForClient(clientId);
};

const markRecommendationRead = async (clientId, recommendationId) => {
  const row = await coachModel.markRecommendationReadForClient({
    id: recommendationId,
    clientId,
  });

  if (!row) {
    throw new Error('Recomendación no encontrada');
  }

  return row;
};

module.exports = {
  getCoachSummaryForClient,
  getMessagesForClient,
  postMessageFromClient,
  getRecommendationsForClient,
  markRecommendationRead,
};
