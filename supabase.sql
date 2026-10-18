-- Base de datos telemedicina2026 adaptada a PostgreSQL (Supabase)
-- Ejecutar entero en Supabase > SQL Editor

-- Borra las tablas si ya existían (para poder ejecutarlo varias veces)
DROP TABLE IF EXISTS areas_salud, resenyas, reservas, recursos, modelos, sanitarios, gestores, ubicaciones, categorias CASCADE;

-- ===== categorias =====
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(25) NOT NULL
);

INSERT INTO categorias (id, nombre) VALUES
(1, 'Termómetro'),
(2, 'Sillas de ruedas'),
(3, 'Fonendoscopio'),
(4, 'Camillas');

-- ===== ubicaciones =====
CREATE TABLE ubicaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(25) NOT NULL
);

INSERT INTO ubicaciones (id, nombre) VALUES
(1, 'Almacén 1'),
(2, 'Laboratorio A'),
(3, 'Urgencias - Box 4'),
(4, 'UCI - Planta 2'),
(5, 'Planta 3 - Ala Norte'),
(6, 'Quirófano 1');

-- ===== gestores =====
CREATE TABLE gestores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(25) NOT NULL,
  apellidos VARCHAR(30) NOT NULL,
  usuario VARCHAR(25) NOT NULL,
  contra VARCHAR(30) NOT NULL
);

INSERT INTO gestores (id, nombre, apellidos, usuario, contra) VALUES
(1, 'María', 'López', 'maria', '1111'),
(2, 'Antonio', 'Rodriguez Usero', 'antonio', '2222'),
(3, 'pepa', 'a', 'a', '1'),
(4, 'Manuel', 'Artés García', 'mag01', '1');

-- ===== sanitarios =====
CREATE TABLE sanitarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(25) NOT NULL,
  apellidos VARCHAR(25) NOT NULL,
  usuario VARCHAR(25) NOT NULL,
  contra VARCHAR(25) NOT NULL
);

INSERT INTO sanitarios (id, nombre, apellidos, usuario, contra) VALUES
(1, 'Paula', 'Artes Rodriguez', 'par45', '1234'),
(2, 'Pepe', 'Rodríguez Orduño', 'pro60', '13456'),
(3, 'Lucía', 'Sánchez Gómez', 'lsg22', '9876'),
(4, 'Marcos', 'López Vega', 'mlv88', 'qwerty'),
(5, 'Elena', 'Beltrán Ruiz', 'ebr10', 'admin2024'),
(6, 'Paula', 'Artes Rodriguez', 'par12', '12345'),
(7, 'Nerea', 'Artés Muñoz', 'nam03', '1'),
(8, 'Gregorio', 'Artés García ', 'Gag1', '1');

-- ===== modelos =====
CREATE TABLE modelos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(40) NOT NULL,
  categoria INTEGER NOT NULL REFERENCES categorias(id),
  horas_maximas INTEGER NOT NULL
);

INSERT INTO modelos (id, nombre, categoria, horas_maximas) VALUES
(1, 'ASY-234', 1, 2),
(2, 'ASY-235', 1, 2),
(3, 'Silla1', 2, 10),
(4, 'Silla2', 2, 10),
(5, 'Fonendo1', 3, 1),
(6, 'Fonendo2', 3, 1),
(7, 'Camilla1', 4, 12),
(8, 'Camilla2', 4, 12);

-- ===== recursos =====
CREATE TABLE recursos (
  id SERIAL PRIMARY KEY,
  modelo INTEGER NOT NULL REFERENCES modelos(id),
  ubicacion INTEGER NOT NULL REFERENCES ubicaciones(id),
  numero_serie VARCHAR(20) NOT NULL,
  estado INTEGER NOT NULL
);

INSERT INTO recursos (id, modelo, ubicacion, numero_serie, estado) VALUES
(1, 1, 3, 'TERM-A-004', 1),
(2, 1, 2, 'TERM-A-002', 1),
(3, 1, 3, 'TERM-A-003', 2),
(4, 8, 2, 'CAM-2-804', 0),
(5, 2, 2, 'TERM-B-102', 1),
(6, 2, 3, 'TERM-B-103', 2),
(7, 3, 1, 'SR-A-01', 0),
(8, 3, 2, 'SR-A-02', 1),
(9, 3, 3, 'SR-A-03', 2),
(10, 4, 1, 'SR-B-201', 0),
(11, 4, 2, 'SR-B-202', 1),
(12, 4, 3, 'SR-B-203', 2),
(13, 5, 1, 'FON-1-501', 0),
(14, 5, 2, 'FON-1-502', 1),
(15, 5, 3, 'FON-1-503', 2),
(16, 6, 1, 'FON-2-601', 0),
(17, 6, 2, 'FON-2-602', 1),
(19, 7, 1, 'CAM-1-701', 0),
(21, 7, 3, 'CAM-1-703', 2),
(22, 8, 1, 'CAM-2-801', 0),
(25, 5, 1, 'AS1234', 2),
(26, 8, 2, 'CAM-2-804', 0);

-- ===== reservas =====
CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  recurso INTEGER NOT NULL REFERENCES recursos(id),
  sanitario INTEGER NOT NULL REFERENCES sanitarios(id),
  horas_estimadas INTEGER NOT NULL,
  fecha_peticion VARCHAR(25) NOT NULL,
  fecha_inicio VARCHAR(25) DEFAULT NULL,
  fecha_fin VARCHAR(25) DEFAULT NULL
);

INSERT INTO reservas (id, recurso, sanitario, horas_estimadas, fecha_peticion, fecha_inicio, fecha_fin) VALUES
(4, 1, 1, 4, '15/02/26 08:00:00', '15/02/26 09:00:00', '15/02/26 13:00:00'),
(5, 1, 2, 2, '17/02/26 10:00:00', '17/02/26 11:30:00', '17/02/26 13:30:00'),
(6, 3, 1, 12, '17/02/26 14:00:00', '26/09/26 19:59:24', '26/09/26 19:59:27'),
(7, 5, 3, 3, '20/03/26 09:00:00', '20/03/26 09:30:00', '20/03/26 12:30:00'),
(8, 9, 3, 1, '22/03/26 08:00:00', '22/03/26 08:15:00', NULL),
(9, 19, 4, 6, '21/03/26 18:00:00', '21/03/26 19:00:00', '22/03/26 01:00:00'),
(10, 10, 4, 2, '22/03/26 10:30:00', '26/09/26 20:10:21', NULL),
(11, 4, 5, 2, '22/03/26 11:00:00', '22/03/26 11:05:00', '22/03/26 13:05:00'),
(13, 19, 1, 3, '25/03/26 09:00:00', '25/03/26 10:00:00', '26/09/26 19:59:19'),
(14, 4, 2, 2, '07/05/26 09:00:00', '07/05/26 09:30:00', '29/09/26 10:13:23'),
(21, 13, 6, 1, '26/09/26 19:53:41', '26/09/26 19:53:41', '26/09/26 19:53:52'),
(25, 22, 1, 1, '26/09/26 20:02:52', '26/09/26 20:02:52', NULL),
(26, 16, 4, 1, '28/09/26 10:05:40', '28/09/26 10:05:40', '28/09/26 10:05:44'),
(28, 13, 2, 1, '29/09/26 10:13:01', '29/09/26 10:13:01', NULL),
(29, 26, 2, 1, '29/09/26 10:18:04', '29/09/26 10:18:04', '29/09/26 10:18:27'),
(33, 16, 8, 2, '09/10/26 19:21:14', '09/10/26 19:21:14', '09/10/26 19:23:19'),
(46, 19, 1, 1, '13/10/26 18:56:34', '13/10/26 18:56:34', NULL),
(50, 16, 8, 1, '15/10/26 16:09:33', '15/10/26 16:09:33', '15/10/26 16:09:43');

-- ===== resenyas =====
CREATE TABLE resenyas (
  id SERIAL PRIMARY KEY,
  recurso INTEGER NOT NULL REFERENCES recursos(id),
  sanitario INTEGER NOT NULL REFERENCES sanitarios(id),
  fecha VARCHAR(30) NOT NULL,
  valor INTEGER NOT NULL,
  descripcion VARCHAR(100) NOT NULL
);

INSERT INTO resenyas (id, recurso, sanitario, fecha, valor, descripcion) VALUES
(1, 1, 1, '15/02/26 12:00:00', 5, 'El respirador funciona perfectamente, calibración muy precisa.'),
(2, 2, 2, '16/02/26 10:30:00', 2, 'La pantalla del monitor parpadea constantemente. Imposible trabajar así.'),
(3, 1, 2, '17/02/26 14:00:00', 4, 'Fácil de usar, aunque la batería dura algo menos de lo indicado.'),
(4, 5, 3, '20/03/26 09:00:00', 5, 'Muy ligera y fácil de maniobrar por los pasillos estrechos.'),
(5, 9, 3, '22/03/26 08:30:00', 3, 'Acústica aceptable, pero las olivas son un poco rígidas e incómodas.'),
(6, 19, 4, '21/03/26 18:45:00', 4, 'El sistema hidráulico responde bien, aunque hace un poco de ruido al bajar.'),
(7, 1, 5, '22/03/26 11:15:00', 1, 'Da lecturas erróneas constantemente. Necesita recalibración urgente.'),
(8, 11, 1, '22/03/26 16:20:00', 4, 'Robusta y el freno de seguridad es muy fiable.'),
(9, 4, 2, '23/03/26 09:10:00', 5, 'Medición instantánea y muy higiénico.'),
(10, 7, 4, '23/03/26 10:00:00', 3, 'Cómoda, pero una rueda chirría un poco.'),
(11, 10, 5, '23/03/26 12:45:00', 4, 'Muy estable para pacientes pesados.'),
(12, 13, 1, '24/03/26 08:30:00', 5, 'Excelente calidad de sonido, se escuchan soplos muy leves.'),
(13, 16, 3, '24/03/26 15:00:00', 2, 'El tubo es demasiado corto, resulta incómodo de usar.'),
(14, 22, 2, '25/03/26 11:00:00', 4, 'Colchón muy cómodo para traslados largos.'),
(15, 19, 5, '25/03/26 13:20:00', 5, 'La mejor camilla de la planta, muy suave de mover.'),
(16, 4, 1, '25/03/26 16:00:00', 4, 'Funciona bien, aunque el estuche está un poco roto.'),
(17, 13, 6, '26/9/2026', 4, 'aaesdd'),
(18, 19, 1, '26/9/2026', 4, 'Es incómoda'),
(19, 16, 4, '28/9/2026', 4, 'Funciona bien'),
(20, 5, 3, '28/9/2026', 1, 'No calibrado'),
(21, 4, 2, '29/9/2026', 1, 'No funciona'),
(22, 26, 2, '29/9/2026', 5, 'Funciona muy bien');

-- ===== areas_salud =====
CREATE TABLE areas_salud (
  codPostal VARCHAR(25) PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL,
  gestor INTEGER NOT NULL REFERENCES gestores(id),
  sanitario INTEGER DEFAULT NULL REFERENCES sanitarios(id)
);

INSERT INTO areas_salud (codPostal, nombre, gestor, sanitario) VALUES
('04129', 'área 3', 1, NULL),
('04130', 'área 1', 1, NULL),
('04131', 'área Centro', 1, 2),
('1', 'a', 1, NULL),
('1111', 'área 2', 1, NULL),
('12', 'área 4', 2, 1);

-- Como hemos insertado los id a mano, ponemos cada contador (SERIAL) por encima del id más alto.
-- Es el equivalente al AUTO_INCREMENT=N de MySQL.
SELECT setval(pg_get_serial_sequence('categorias','id'), (SELECT MAX(id) FROM categorias));
SELECT setval(pg_get_serial_sequence('ubicaciones','id'), (SELECT MAX(id) FROM ubicaciones));
SELECT setval(pg_get_serial_sequence('gestores','id'), (SELECT MAX(id) FROM gestores));
SELECT setval(pg_get_serial_sequence('sanitarios','id'), (SELECT MAX(id) FROM sanitarios));
SELECT setval(pg_get_serial_sequence('modelos','id'), (SELECT MAX(id) FROM modelos));
SELECT setval(pg_get_serial_sequence('recursos','id'), (SELECT MAX(id) FROM recursos));
SELECT setval(pg_get_serial_sequence('reservas','id'), (SELECT MAX(id) FROM reservas));
SELECT setval(pg_get_serial_sequence('resenyas','id'), (SELECT MAX(id) FROM resenyas));
