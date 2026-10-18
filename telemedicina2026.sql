-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-10-2026 a las 16:21:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `telemedicina2026`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_medicas`
--

CREATE TABLE `areas_medicas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas_medicas`
--

INSERT INTO `areas_medicas` (`id`, `nombre`) VALUES
(1, 'Alergología'),
(2, 'Anestesiología'),
(3, 'Cardiología'),
(4, 'Cirugía General'),
(5, 'Dermatología'),
(6, 'Aparato Digestivo'),
(7, 'Endocrinología'),
(8, 'Ginecología'),
(9, 'Hematología'),
(10, 'Medicina Interna'),
(11, 'Neumología'),
(12, 'Neurología'),
(13, 'Oftalmología'),
(14, 'Oncología'),
(15, 'Pediatría'),
(16, 'Psiquiatría'),
(17, 'Traumatología'),
(18, 'Urología');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas_salud`
--

CREATE TABLE `areas_salud` (
  `codPostal` varchar(25) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `gestor` int(11) NOT NULL,
  `sanitario` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `areas_salud`
--

INSERT INTO `areas_salud` (`codPostal`, `nombre`, `gestor`, `sanitario`) VALUES
('04129', 'área 3', 1, NULL),
('04130', 'área 1', 1, NULL),
('04131', 'área Centro', 1, 2),
('1', 'a', 1, NULL),
('1111', 'área 2', 1, NULL),
('12', 'área 4', 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(1, 'Termómetro'),
(2, 'Sillas de ruedas'),
(3, 'Fonendoscopio'),
(4, 'Camillas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gestores`
--

CREATE TABLE `gestores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `apellidos` varchar(30) NOT NULL,
  `usuario` varchar(25) NOT NULL,
  `contra` varchar(30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gestores`
--

INSERT INTO `gestores` (`id`, `nombre`, `apellidos`, `usuario`, `contra`) VALUES
(1, 'María', 'López', 'maria', '1111'),
(2, 'Antonio', 'Rodriguez Usero', 'antonio', '2222'),
(3, 'pepa', 'a', 'a', '1'),
(4, 'Manuel', 'Artés García', 'mag01', '1');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modelos`
--

CREATE TABLE `modelos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(40) NOT NULL,
  `categoria` int(11) NOT NULL,
  `horas_maximas` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `modelos`
--

INSERT INTO `modelos` (`id`, `nombre`, `categoria`, `horas_maximas`) VALUES
(1, 'ASY-234', 1, 2),
(2, 'ASY-235', 1, 2),
(3, 'Silla1', 2, 10),
(4, 'Silla2', 2, 10),
(5, 'Fonendo1', 3, 1),
(6, 'Fonendo2', 3, 1),
(7, 'Camilla1', 4, 12),
(8, 'Camilla2', 4, 12);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recursos`
--

CREATE TABLE `recursos` (
  `id` int(11) NOT NULL,
  `modelo` int(11) NOT NULL,
  `ubicacion` int(11) NOT NULL,
  `numero_serie` varchar(20) NOT NULL,
  `estado` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `recursos`
--

INSERT INTO `recursos` (`id`, `modelo`, `ubicacion`, `numero_serie`, `estado`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenyas`
--

CREATE TABLE `resenyas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `fecha` varchar(30) NOT NULL,
  `valor` int(11) NOT NULL,
  `descripcion` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `resenyas`
--

INSERT INTO `resenyas` (`id`, `recurso`, `sanitario`, `fecha`, `valor`, `descripcion`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `recurso` int(11) NOT NULL,
  `sanitario` int(11) NOT NULL,
  `horas_estimadas` int(11) NOT NULL,
  `fecha_peticion` varchar(25) NOT NULL,
  `fecha_inicio` varchar(25) DEFAULT NULL,
  `fecha_fin` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `recurso`, `sanitario`, `horas_estimadas`, `fecha_peticion`, `fecha_inicio`, `fecha_fin`) VALUES
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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sanitarios`
--

CREATE TABLE `sanitarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `apellidos` varchar(25) NOT NULL,
  `usuario` varchar(25) NOT NULL,
  `contra` varchar(25) NOT NULL,
  `area` int(11) NOT NULL,
  `id_area` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sanitarios`
--

INSERT INTO `sanitarios` (`id`, `nombre`, `apellidos`, `usuario`, `contra`, `area`, `id_area`) VALUES
(1, 'Paula', 'Artes Rodriguez', 'par45', '1234', 0, 3),
(2, 'Pepe', 'Rodríguez Orduño', 'pro60', '13456', 0, 15),
(3, 'Lucía', 'Sánchez Gómez', 'lsg22', '9876', 0, 3),
(4, 'Marcos', 'López Vega', 'mlv88', 'qwerty', 0, 17),
(5, 'Elena', 'Beltrán Ruiz', 'ebr10', 'admin2024', 0, 12),
(6, 'Paula', 'Artes Rodriguez', 'par12', '12345', 0, 15),
(7, 'Nerea', 'Artés Muñoz', 'nam03', '1', 0, 14),
(8, 'Gregorio', 'Artés García ', 'Gag1', '1', 0, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicaciones`
--

CREATE TABLE `ubicaciones` (
  `id` int(11) NOT NULL,
  `nombre` varchar(25) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicaciones`
--

INSERT INTO `ubicaciones` (`id`, `nombre`) VALUES
(1, 'Almacén 1'),
(2, 'Laboratorio A'),
(3, 'Urgencias - Box 4'),
(4, 'UCI - Planta 2'),
(5, 'Planta 3 - Ala Norte'),
(6, 'Quirófano 1');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas_medicas`
--
ALTER TABLE `areas_medicas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `areas_salud`
--
ALTER TABLE `areas_salud`
  ADD PRIMARY KEY (`codPostal`),
  ADD KEY `ar1` (`gestor`),
  ADD KEY `ar2` (`sanitario`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `gestores`
--
ALTER TABLE `gestores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `modelos` (`categoria`);

--
-- Indices de la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `recursos` (`modelo`),
  ADD KEY `recursos2` (`ubicacion`);

--
-- Indices de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `resenya1` (`recurso`),
  ADD KEY `resenya2` (`sanitario`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reservas1` (`recurso`),
  ADD KEY `reservas2` (`sanitario`);

--
-- Indices de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sanitario_area` (`id_area`);

--
-- Indices de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas_medicas`
--
ALTER TABLE `areas_medicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `gestores`
--
ALTER TABLE `gestores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `modelos`
--
ALTER TABLE `modelos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `recursos`
--
ALTER TABLE `recursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `resenyas`
--
ALTER TABLE `resenyas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT de la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `ubicaciones`
--
ALTER TABLE `ubicaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `areas_salud`
--
ALTER TABLE `areas_salud`
  ADD CONSTRAINT `ar1` FOREIGN KEY (`gestor`) REFERENCES `gestores` (`id`),
  ADD CONSTRAINT `ar2` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `modelos`
--
ALTER TABLE `modelos`
  ADD CONSTRAINT `modelos` FOREIGN KEY (`categoria`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `recursos`
--
ALTER TABLE `recursos`
  ADD CONSTRAINT `recursos` FOREIGN KEY (`modelo`) REFERENCES `modelos` (`id`),
  ADD CONSTRAINT `recursos2` FOREIGN KEY (`ubicacion`) REFERENCES `ubicaciones` (`id`);

--
-- Filtros para la tabla `resenyas`
--
ALTER TABLE `resenyas`
  ADD CONSTRAINT `resenya1` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `resenya2` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas1` FOREIGN KEY (`recurso`) REFERENCES `recursos` (`id`),
  ADD CONSTRAINT `reservas2` FOREIGN KEY (`sanitario`) REFERENCES `sanitarios` (`id`);

--
-- Filtros para la tabla `sanitarios`
--
ALTER TABLE `sanitarios`
  ADD CONSTRAINT `sanitario_area` FOREIGN KEY (`id_area`) REFERENCES `areas_medicas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
