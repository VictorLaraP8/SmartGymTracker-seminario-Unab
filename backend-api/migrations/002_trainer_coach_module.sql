-- Módulo COACH: vínculo entrenador–alumno, mensajes y recomendaciones.
-- Ejecutar contra la misma base PostgreSQL que usa la API.

CREATE TABLE IF NOT EXISTS trainer_client_assignments (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT trainer_client_distinct CHECK (trainer_id <> client_id)
);

-- Un solo vínculo activo por alumno (cualquier entrenador).
CREATE UNIQUE INDEX IF NOT EXISTS trainer_client_one_active_per_client
  ON trainer_client_assignments (client_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_trainer_client_trainer_active
  ON trainer_client_assignments (trainer_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS coach_messages (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT coach_messages_distinct CHECK (sender_id <> recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_coach_messages_pair_created
  ON coach_messages (sender_id, recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_coach_messages_recipient_unread
  ON coach_messages (recipient_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE TABLE IF NOT EXISTS coach_recommendations (
  id SERIAL PRIMARY KEY,
  trainer_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  client_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coach_rec_client_created
  ON coach_recommendations (client_id, created_at DESC);

-- Datos de prueba (opcional): ajusta IDs a usuarios reales (trainer y user).
-- INSERT INTO trainer_client_assignments (trainer_id, client_id, status) VALUES (2, 1, 'active');
-- INSERT INTO coach_messages (sender_id, recipient_id, body) VALUES (2, 1, 'Hola, ¿cómo van los entrenos?');
-- INSERT INTO coach_recommendations (trainer_id, client_id, title, body) VALUES (2, 1, 'Descanso', 'Incluye 1 día activo de movilidad esta semana.');
