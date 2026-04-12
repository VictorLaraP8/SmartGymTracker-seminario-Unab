const pool = require('../config/db');

const createGoal = async ({
  userId,
  weeklySessionsGoal,
  weeklyVolumeGoal,
  adherenceGoal,
}) => {
  const query = `
    INSERT INTO goals (user_id, weekly_sessions_goal, weekly_volume_goal, adherence_goal)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, weekly_sessions_goal, weekly_volume_goal, adherence_goal, created_at
  `;
  const values = [userId, weeklySessionsGoal, weeklyVolumeGoal, adherenceGoal];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const getGoalByUserId = async (userId) => {
  const query = `
    SELECT id, user_id, weekly_sessions_goal, weekly_volume_goal, adherence_goal, created_at
    FROM goals
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const updateGoal = async ({
  id,
  userId,
  weeklySessionsGoal,
  weeklyVolumeGoal,
  adherenceGoal,
}) => {
  const query = `
    UPDATE goals
    SET weekly_sessions_goal = $1,
        weekly_volume_goal = $2,
        adherence_goal = $3
    WHERE id = $4 AND user_id = $5
    RETURNING id, user_id, weekly_sessions_goal, weekly_volume_goal, adherence_goal, created_at
  `;
  const values = [weeklySessionsGoal, weeklyVolumeGoal, adherenceGoal, id, userId];
  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  createGoal,
  getGoalByUserId,
  updateGoal,
};