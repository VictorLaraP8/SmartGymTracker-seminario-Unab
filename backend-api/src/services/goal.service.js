const goalModel = require('../models/goal.model');

const createGoal = async ({
  userId,
  weeklySessionsGoal,
  weeklyVolumeGoal,
  adherenceGoal,
}) => {
  if (!weeklySessionsGoal || !weeklyVolumeGoal || !adherenceGoal) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (
    Number(weeklySessionsGoal) <= 0 ||
    Number(weeklyVolumeGoal) <= 0 ||
    Number(adherenceGoal) <= 0
  ) {
    throw new Error('Los valores de la meta deben ser mayores a 0');
  }

  const existingGoal = await goalModel.getGoalByUserId(userId);

  if (existingGoal) {
    throw new Error('El usuario ya tiene una meta creada');
  }

  return await goalModel.createGoal({
    userId,
    weeklySessionsGoal,
    weeklyVolumeGoal,
    adherenceGoal,
  });
};

const getMyGoal = async (userId) => {
  return await goalModel.getGoalByUserId(userId);
};

const updateGoal = async ({
  id,
  userId,
  weeklySessionsGoal,
  weeklyVolumeGoal,
  adherenceGoal,
}) => {
  if (!weeklySessionsGoal || !weeklyVolumeGoal || !adherenceGoal) {
    throw new Error('Todos los campos son obligatorios');
  }

  if (
    Number(weeklySessionsGoal) <= 0 ||
    Number(weeklyVolumeGoal) <= 0 ||
    Number(adherenceGoal) <= 0
  ) {
    throw new Error('Los valores de la meta deben ser mayores a 0');
  }

  const updatedGoal = await goalModel.updateGoal({
    id,
    userId,
    weeklySessionsGoal,
    weeklyVolumeGoal,
    adherenceGoal,
  });

  if (!updatedGoal) {
    throw new Error('Meta no encontrada o no autorizada');
  }

  return updatedGoal;
};

module.exports = {
  createGoal,
  getMyGoal,
  updateGoal,
};