const trainerCoachService = require('../services/trainerCoach.service');

const assignByEmail = async (req, res) => {
  try {
    const result = await trainerCoachService.assignClientByEmail(req.user.id, req.body.clientEmail);

    return res.status(result.alreadyAssigned ? 200 : 201).json({
      success: true,
      message: result.alreadyAssigned
        ? 'El alumno ya estaba asignado a tu cuenta'
        : 'Alumno asignado correctamente',
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const listClients = async (req, res) => {
  try {
    const data = await trainerCoachService.listTrainerClients(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Alumnos obtenidos correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTrainerClientMessages = async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const data = await trainerCoachService.listMessagesForTrainer(req.user.id, clientId);

    return res.status(200).json({
      success: true,
      message: 'Mensajes obtenidos correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getTrainerClientRecommendations = async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const data = await trainerCoachService.listRecommendationsForTrainer(req.user.id, clientId);

    return res.status(200).json({
      success: true,
      message: 'Recomendaciones obtenidas correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const sendMessageToClient = async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const data = await trainerCoachService.postMessageFromTrainer(
      req.user.id,
      clientId,
      req.body.body
    );

    return res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const sendRecommendation = async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const data = await trainerCoachService.postRecommendationFromTrainer(
      req.user.id,
      clientId,
      req.body.title,
      req.body.body
    );

    return res.status(201).json({
      success: true,
      message: 'Recomendación creada correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  assignByEmail,
  listClients,
  getTrainerClientMessages,
  getTrainerClientRecommendations,
  sendMessageToClient,
  sendRecommendation,
};
