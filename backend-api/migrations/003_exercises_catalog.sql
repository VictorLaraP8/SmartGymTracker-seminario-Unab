-- Catálogo ampliado de ejercicios (idempotente).
-- Ejecutar: psql "$DATABASE_URL" -f backend-api/migrations/003_exercises_catalog.sql
-- No borra ni duplica ejercicios ya existentes con el mismo nombre.

-- Pecho
INSERT INTO exercises (name, muscle_group)
SELECT 'Press banca', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press banca');

INSERT INTO exercises (name, muscle_group)
SELECT 'Press inclinado con barra', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press inclinado con barra');

INSERT INTO exercises (name, muscle_group)
SELECT 'Press inclinado mancuernas', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press inclinado mancuernas');

INSERT INTO exercises (name, muscle_group)
SELECT 'Aperturas mancuernas', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Aperturas mancuernas');

INSERT INTO exercises (name, muscle_group)
SELECT 'Aperturas en polea', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Aperturas en polea');

INSERT INTO exercises (name, muscle_group)
SELECT 'Fondos en paralelas', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Fondos en paralelas');

INSERT INTO exercises (name, muscle_group)
SELECT 'Press declinado', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press declinado');

INSERT INTO exercises (name, muscle_group)
SELECT 'Pullover', 'Pecho'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Pullover');

-- Espalda
INSERT INTO exercises (name, muscle_group)
SELECT 'Dominadas', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Dominadas');

INSERT INTO exercises (name, muscle_group)
SELECT 'Jalón al pecho', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Jalón al pecho');

INSERT INTO exercises (name, muscle_group)
SELECT 'Remo con barra', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo con barra');

INSERT INTO exercises (name, muscle_group)
SELECT 'Remo con mancuerna', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo con mancuerna');

INSERT INTO exercises (name, muscle_group)
SELECT 'Remo en polea baja', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo en polea baja');

INSERT INTO exercises (name, muscle_group)
SELECT 'Peso muerto', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Peso muerto');

INSERT INTO exercises (name, muscle_group)
SELECT 'Pull-over polea', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Pull-over polea');

INSERT INTO exercises (name, muscle_group)
SELECT 'Face pull', 'Espalda'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Face pull');

-- Piernas
INSERT INTO exercises (name, muscle_group)
SELECT 'Sentadilla', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Sentadilla');

INSERT INTO exercises (name, muscle_group)
SELECT 'Sentadilla frontal', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Sentadilla frontal');

INSERT INTO exercises (name, muscle_group)
SELECT 'Prensa', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Prensa');

INSERT INTO exercises (name, muscle_group)
SELECT 'Extensión de cuádriceps', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Extensión de cuádriceps');

INSERT INTO exercises (name, muscle_group)
SELECT 'Curl femoral', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Curl femoral');

INSERT INTO exercises (name, muscle_group)
SELECT 'Zancadas', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Zancadas');

INSERT INTO exercises (name, muscle_group)
SELECT 'Peso muerto rumano', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Peso muerto rumano');

INSERT INTO exercises (name, muscle_group)
SELECT 'Gemelos de pie', 'Piernas'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Gemelos de pie');

-- Hombros
INSERT INTO exercises (name, muscle_group)
SELECT 'Press militar', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press militar');

INSERT INTO exercises (name, muscle_group)
SELECT 'Press Arnold', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press Arnold');

INSERT INTO exercises (name, muscle_group)
SELECT 'Elevaciones laterales', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Elevaciones laterales');

INSERT INTO exercises (name, muscle_group)
SELECT 'Elevaciones frontales', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Elevaciones frontales');

INSERT INTO exercises (name, muscle_group)
SELECT 'Pájaros', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Pájaros');

INSERT INTO exercises (name, muscle_group)
SELECT 'Remo al mentón', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo al mentón');

INSERT INTO exercises (name, muscle_group)
SELECT 'Encogimientos', 'Hombros'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Encogimientos');

-- Brazos
INSERT INTO exercises (name, muscle_group)
SELECT 'Curl de bíceps con barra', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Curl de bíceps con barra');

INSERT INTO exercises (name, muscle_group)
SELECT 'Curl martillo', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Curl martillo');

INSERT INTO exercises (name, muscle_group)
SELECT 'Curl predicador', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Curl predicador');

INSERT INTO exercises (name, muscle_group)
SELECT 'Press francés', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Press francés');

INSERT INTO exercises (name, muscle_group)
SELECT 'Fondos en banco', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Fondos en banco');

INSERT INTO exercises (name, muscle_group)
SELECT 'Extensión tríceps polea', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Extensión tríceps polea');

INSERT INTO exercises (name, muscle_group)
SELECT 'Patada de tríceps', 'Brazos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Patada de tríceps');

-- Glúteos
INSERT INTO exercises (name, muscle_group)
SELECT 'Hip thrust', 'Glúteos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Hip thrust');

INSERT INTO exercises (name, muscle_group)
SELECT 'Patada de glúteo', 'Glúteos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Patada de glúteo');

INSERT INTO exercises (name, muscle_group)
SELECT 'Sentadilla búlgara', 'Glúteos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Sentadilla búlgara');

INSERT INTO exercises (name, muscle_group)
SELECT 'Abducción en máquina', 'Glúteos'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Abducción en máquina');

-- Core
INSERT INTO exercises (name, muscle_group)
SELECT 'Plancha', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Plancha');

INSERT INTO exercises (name, muscle_group)
SELECT 'Crunch abdominal', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Crunch abdominal');

INSERT INTO exercises (name, muscle_group)
SELECT 'Elevación de piernas colgado', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Elevación de piernas colgado');

INSERT INTO exercises (name, muscle_group)
SELECT 'Russian twist', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Russian twist');

INSERT INTO exercises (name, muscle_group)
SELECT 'Mountain climbers', 'Core'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Mountain climbers');

-- Cardio
INSERT INTO exercises (name, muscle_group)
SELECT 'Cinta / trote', 'Cardio'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Cinta / trote');

INSERT INTO exercises (name, muscle_group)
SELECT 'Bicicleta estática', 'Cardio'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Bicicleta estática');

INSERT INTO exercises (name, muscle_group)
SELECT 'Elíptica', 'Cardio'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Elíptica');

INSERT INTO exercises (name, muscle_group)
SELECT 'Remo máquina', 'Cardio'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Remo máquina');

INSERT INTO exercises (name, muscle_group)
SELECT 'Escaladora', 'Cardio'
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE name = 'Escaladora');

-- ROLLBACK (descomenta para quitar solo estos nombres del catálogo).
-- Si hay entrenamientos que referencian estos ejercicios, puede fallar por FK;
-- en ese caso borra primero las filas en workout_exercises o usa CASCADE según tu esquema.
--
-- DELETE FROM exercises
-- WHERE name IN (
--   'Press banca', 'Press inclinado con barra', 'Press inclinado mancuernas', 'Aperturas mancuernas',
--   'Aperturas en polea', 'Fondos en paralelas', 'Press declinado', 'Pullover',
--   'Dominadas', 'Jalón al pecho', 'Remo con barra', 'Remo con mancuerna', 'Remo en polea baja',
--   'Peso muerto', 'Pull-over polea', 'Face pull',
--   'Sentadilla', 'Sentadilla frontal', 'Prensa', 'Extensión de cuádriceps', 'Curl femoral',
--   'Zancadas', 'Peso muerto rumano', 'Gemelos de pie',
--   'Press militar', 'Press Arnold', 'Elevaciones laterales', 'Elevaciones frontales', 'Pájaros',
--   'Remo al mentón', 'Encogimientos',
--   'Curl de bíceps con barra', 'Curl martillo', 'Curl predicador', 'Press francés', 'Fondos en banco',
--   'Extensión tríceps polea', 'Patada de tríceps',
--   'Hip thrust', 'Patada de glúteo', 'Sentadilla búlgara', 'Abducción en máquina',
--   'Plancha', 'Crunch abdominal', 'Elevación de piernas colgado', 'Russian twist', 'Mountain climbers',
--   'Cinta / trote', 'Bicicleta estática', 'Elíptica', 'Remo máquina', 'Escaladora'
-- );
