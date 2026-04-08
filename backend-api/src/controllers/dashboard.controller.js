const dashboardService = require('../services/dashboard.service');

const getMyDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getMyDashboard(userId);

    return res.status(200).json({
      success: true,
      message: 'Dashboard obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getMyRecommendations(userId);

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

const getMyAdherence = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getMyAdherence(userId);

    return res.status(200).json({
      success: true,
      message: 'Adherencia obtenida correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUserScore = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await dashboardService.getUserScore(userId);

    return res.status(200).json({
      success: true,
      message: 'Score obtenido correctamente',
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getUsersRanking = async (req, res) => {
  try {
    const data = await dashboardService.getUsersRanking();

    return res.status(200).json({
      success: true,
      message: 'Ranking obtenido correctamente',
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
  getMyDashboard,
  getMyRecommendations,
  getMyAdherence,
  getUserScore,
  getUsersRanking,
};