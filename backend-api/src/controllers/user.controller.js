const userService = require('../services/user.service');

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

module.exports = {
  getMyInactivityStatus,
  getUserAlerts,
};