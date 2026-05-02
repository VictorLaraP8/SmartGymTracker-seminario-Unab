const userService = require('../services/user.service');
const profileService = require('../services/profile.service');

const getMyInactivityStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await userService.getMyInactivityStatus(userId);

    return res.status(200).json({
      success: true,
      message: 'Estado de actividad obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await userService.getUserAlerts(userId);

    return res.status(200).json({
      success: true,
      message: 'Alertas generadas correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsersAtRisk = async (req, res) => {
  try {
    const usersAtRisk = await userService.getUsersAtRisk();

    return res.status(200).json({
      success: true,
      message: 'Usuarios en riesgo obtenidos correctamente',
      data: usersAtRisk,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const data = await profileService.getMyProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Perfil obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const patchMe = async (req, res) => {
  try {
    const data = await profileService.updateMyProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProgress = async (req, res) => {
  try {
    const data = await profileService.getMyProgress(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Progreso corporal obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const createMyProgress = async (req, res) => {
  try {
    const data = await profileService.createMyProgress(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: 'Medición registrada correctamente',
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
  getMyInactivityStatus,
  getUserAlerts,
  getUsersAtRisk,
  getMe,
  patchMe,
  getMyProgress,
  createMyProgress,
};