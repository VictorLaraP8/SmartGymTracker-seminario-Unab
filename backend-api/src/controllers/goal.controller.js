const goalService = require('../services/goal.service');

const createGoal = async (req, res) => {
  try {
    const userId = req.user.id;

    const goal = await goalService.createGoal({
      userId,
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: 'Meta creada correctamente',
      data: goal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const goal = await goalService.getMyGoal(userId);

    return res.status(200).json({
      success: true,
      message: 'Meta obtenida correctamente',
      data: goal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const goal = await goalService.updateGoal({
      id,
      userId,
      ...req.body,
    });

    return res.status(200).json({
      success: true,
      message: 'Meta actualizada correctamente',
      data: goal,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createGoal,
  getMyGoal,
  updateGoal,
};