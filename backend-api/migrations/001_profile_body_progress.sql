-- Perfil extendido (usuario) + mediciones corporales (histórico)
-- Ejecutar contra la misma base PostgreSQL que usa la API.

ALTER TABLE users ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS altura_cm NUMERIC(5, 2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS objetivo VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(32) NOT NULL DEFAULT 'active';

CREATE TABLE IF NOT EXISTS body_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  peso_corporal NUMERIC(6, 2),
  porcentaje_grasa NUMERIC(5, 2),
  masa_muscular NUMERIC(6, 2),
  imc NUMERIC(5, 2),
  observacion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT body_progress_user_fecha_unique UNIQUE (user_id, fecha)
);

CREATE INDEX IF NOT EXISTS idx_body_progress_user_fecha ON body_progress (user_id, fecha DESC);
