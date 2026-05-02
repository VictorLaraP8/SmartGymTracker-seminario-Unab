const pool = require('../config/db');

const findActiveAssignmentForClient = async (clientId) => {
  const query = `
    SELECT
      tca.id AS assignment_id,
      tca.trainer_id,
      tca.client_id,
      tca.status,
      tca.created_at,
      u.id AS trainer_user_id,
      u.name AS trainer_name,
      u.email AS trainer_email
    FROM trainer_client_assignments tca
    INNER JOIN users u ON u.id = tca.trainer_id
    WHERE tca.client_id = $1 AND tca.status = 'active'
    LIMIT 1
  `;
  const result = await pool.query(query, [clientId]);
  return result.rows[0] || null;
};

const findActiveAssignmentForTrainerAndClient = async (trainerId, clientId) => {
  const query = `
    SELECT id, trainer_id, client_id, status, created_at
    FROM trainer_client_assignments
    WHERE trainer_id = $1 AND client_id = $2 AND status = 'active'
    LIMIT 1
  `;
  const result = await pool.query(query, [trainerId, clientId]);
  return result.rows[0] || null;
};

const listActiveClientsForTrainer = async (trainerId) => {
  const query = `
    SELECT
      tca.client_id,
      u.name AS client_name,
      u.email AS client_email,
      tca.created_at
    FROM trainer_client_assignments tca
    INNER JOIN users u ON u.id = tca.client_id
    WHERE tca.trainer_id = $1 AND tca.status = 'active'
    ORDER BY u.name ASC
  `;
  const result = await pool.query(query, [trainerId]);
  return result.rows;
};

const insertAssignment = async ({ trainerId, clientId }) => {
  const query = `
    INSERT INTO trainer_client_assignments (trainer_id, client_id, status)
    VALUES ($1, $2, 'active')
    RETURNING id, trainer_id, client_id, status, created_at
  `;
  const result = await pool.query(query, [trainerId, clientId]);
  return result.rows[0];
};

const countUnreadMessagesForRecipient = async (recipientId, peerId) => {
  const query = `
    SELECT COUNT(*)::int AS c
    FROM coach_messages
    WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL
  `;
  const result = await pool.query(query, [recipientId, peerId]);
  return result.rows[0]?.c ?? 0;
};

const countUnreadRecommendationsForClient = async (clientId) => {
  const query = `
    SELECT COUNT(*)::int AS c
    FROM coach_recommendations
    WHERE client_id = $1 AND read_at IS NULL
  `;
  const result = await pool.query(query, [clientId]);
  return result.rows[0]?.c ?? 0;
};

const listConversationMessages = async (userIdA, userIdB) => {
  const query = `
    SELECT id, sender_id, recipient_id, body, read_at, created_at
    FROM coach_messages
    WHERE (sender_id = $1 AND recipient_id = $2)
       OR (sender_id = $2 AND recipient_id = $1)
    ORDER BY created_at ASC, id ASC
  `;
  const result = await pool.query(query, [userIdA, userIdB]);
  return result.rows;
};

const markMessagesReadForPair = async (recipientId, senderId) => {
  const query = `
    UPDATE coach_messages
    SET read_at = NOW()
    WHERE recipient_id = $1 AND sender_id = $2 AND read_at IS NULL
    RETURNING id
  `;
  const result = await pool.query(query, [recipientId, senderId]);
  return result.rowCount;
};

const insertMessage = async ({ senderId, recipientId, body }) => {
  const query = `
    INSERT INTO coach_messages (sender_id, recipient_id, body)
    VALUES ($1, $2, $3)
    RETURNING id, sender_id, recipient_id, body, read_at, created_at
  `;
  const result = await pool.query(query, [senderId, recipientId, body]);
  return result.rows[0];
};

const listRecommendationsForClient = async (clientId) => {
  const query = `
    SELECT id, trainer_id, client_id, title, body, read_at, created_at
    FROM coach_recommendations
    WHERE client_id = $1
    ORDER BY created_at DESC, id DESC
  `;
  const result = await pool.query(query, [clientId]);
  return result.rows;
};

const insertRecommendation = async ({ trainerId, clientId, title, body }) => {
  const query = `
    INSERT INTO coach_recommendations (trainer_id, client_id, title, body)
    VALUES ($1, $2, $3, $4)
    RETURNING id, trainer_id, client_id, title, body, read_at, created_at
  `;
  const result = await pool.query(query, [trainerId, clientId, title, body]);
  return result.rows[0];
};

const markRecommendationReadForClient = async ({ id, clientId }) => {
  const query = `
    UPDATE coach_recommendations
    SET read_at = COALESCE(read_at, NOW())
    WHERE id = $1 AND client_id = $2
    RETURNING id, trainer_id, client_id, title, body, read_at, created_at
  `;
  const result = await pool.query(query, [id, clientId]);
  return result.rows[0] || null;
};

module.exports = {
  findActiveAssignmentForClient,
  findActiveAssignmentForTrainerAndClient,
  listActiveClientsForTrainer,
  insertAssignment,
  countUnreadMessagesForRecipient,
  countUnreadRecommendationsForClient,
  listConversationMessages,
  markMessagesReadForPair,
  insertMessage,
  listRecommendationsForClient,
  insertRecommendation,
  markRecommendationReadForClient,
};
