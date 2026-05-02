const userModel = require('../models/user.model');
const coachModel = require('../models/coach.model');

const assignClientByEmail = async (trainerId, clientEmail) => {
  const email = String(clientEmail || '').trim().toLowerCase();

  if (!email) {
    throw new Error('El correo del alumno es obligatorio');
  }

  const client = await userModel.findUserByEmail(email);

  if (!client) {
    throw new Error('No existe un usuario con ese correo');
  }

  if (client.role !== 'user') {
    throw new Error('Solo se pueden asignar cuentas con rol de alumno');
  }

  if (client.id === trainerId) {
    throw new Error('No puedes asignarte a ti mismo');
  }

  const existing = await coachModel.findActiveAssignmentForClient(client.id);

  if (existing) {
    if (existing.trainer_id === trainerId) {
      return {
        alreadyAssigned: true,
        assignment: existing,
        client: { id: client.id, name: client.name, email: client.email },
      };
    }

    throw new Error('Este alumno ya tiene un entrenador asignado');
  }

  const assignment = await coachModel.insertAssignment({
    trainerId,
    clientId: client.id,
  });

  return {
    alreadyAssigned: false,
    assignment,
    client: { id: client.id, name: client.name, email: client.email },
  };
};

const listTrainerClients = async (trainerId) => {
  return await coachModel.listActiveClientsForTrainer(trainerId);
};

const postMessageFromTrainer = async (trainerId, clientId, body) => {
  const trimmed = String(body || '').trim();

  if (!trimmed) {
    throw new Error('El mensaje no puede estar vacío');
  }

  if (trimmed.length > 8000) {
    throw new Error('El mensaje es demasiado largo');
  }

  const assignment = await coachModel.findActiveAssignmentForTrainerAndClient(trainerId, clientId);

  if (!assignment) {
    throw new Error('No tienes una asignación activa con este alumno');
  }

  return await coachModel.insertMessage({
    senderId: trainerId,
    recipientId: clientId,
    body: trimmed,
  });
};

const postRecommendationFromTrainer = async (trainerId, clientId, title, body) => {
  const t = String(title || '').trim();
  const b = String(body || '').trim();

  if (!t) {
    throw new Error('El título es obligatorio');
  }

  if (!b) {
    throw new Error('El contenido es obligatorio');
  }

  if (t.length > 255) {
    throw new Error('El título es demasiado largo');
  }

  const assignment = await coachModel.findActiveAssignmentForTrainerAndClient(trainerId, clientId);

  if (!assignment) {
    throw new Error('No tienes una asignación activa con este alumno');
  }

  return await coachModel.insertRecommendation({
    trainerId,
    clientId,
    title: t,
    body: b,
  });
};

module.exports = {
  assignClientByEmail,
  listTrainerClients,
  postMessageFromTrainer,
  postRecommendationFromTrainer,
};
