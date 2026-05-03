-- RIR (repeticiones en reserva) y RPE (escala de esfuerzo percibido) por bloque de ejercicio.
-- Opcionales: filas existentes quedan con NULL.

ALTER TABLE workout_exercises
  ADD COLUMN IF NOT EXISTS rir SMALLINT NULL,
  ADD COLUMN IF NOT EXISTS rpe NUMERIC(3,1) NULL;

COMMENT ON COLUMN workout_exercises.rir IS 'Repeticiones en reserva (0-10), opcional';
COMMENT ON COLUMN workout_exercises.rpe IS 'RPE fuerza típico 6.0-10.0, opcional';
