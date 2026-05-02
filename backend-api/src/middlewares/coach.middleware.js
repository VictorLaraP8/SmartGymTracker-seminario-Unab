const coachModel = require('../models/coach.model');

const ensureTrainerClient = async (req, res, next) => {
  try {
    const trainerId = req.user.id;
    const clientId = Number(req.params.clientId);

    if (!Number.isFinite(clientId) || clientId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'clientId inválido',
      });
    }

    const assignment = await coachModel.findActiveAssignmentForTrainerAndClient(
      trainerId,
      clientId
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: 'No tienes una asignación activa con este alumno',
      });
    }

    req.coachAssignment = assignment;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  ensureTrainerClient,
};
