const coachService = require('../services/coach.service');

const getSummary = async (req, res) => {
  try {
    const data = await coachService.getCoachSummaryForClient(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Estado del coach obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const data = await coachService.getMessagesForClient(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Mensajes obtenidos correctamente',
      data,
    });
  } catch (error) {
    const status = error.message === 'No tienes un entrenador asignado' ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const postMessage = async (req, res) => {
  try {
    const data = await coachService.postMessageFromClient(req.user.id, req.body.body);

    return res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data,
    });
  } catch (error) {
    const status = error.message === 'No tienes un entrenador asignado' ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const data = await coachService.getRecommendationsForClient(req.user.id);

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

const patchRecommendationRead = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
      });
    }

    const data = await coachService.markRecommendationRead(req.user.id, id);

    return res.status(200).json({
      success: true,
      message: 'Recomendación marcada como leída',
      data,
    });
  } catch (error) {
    const status = error.message === 'Recomendación no encontrada' ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getSummary,
  getMessages,
  postMessage,
  getRecommendations,
  patchRecommendationRead,
};
