-- Peso corporal actual en el perfil del usuario (kg), para IMC junto a altura_cm.
ALTER TABLE users ADD COLUMN IF NOT EXISTS peso_corporal NUMERIC(6, 2);
