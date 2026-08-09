-- Esquema de la clínica. En este curso el SQL lo escribimos nosotros: no hay ORM.
--
-- Este archivo lo ejecuta MySQL automáticamente la PRIMERA vez que se crea el
-- volumen de datos (carpeta docker-entrypoint-initdb.d). Si lo cambiás, la base
-- NO se actualiza sola: hay que renacer el volumen con
--     docker compose down -v && docker compose up -d
-- (y volver a cargar los datos con datos_iniciales.php).

-- ============================================================================
-- USUARIOS: una jerarquía (Usuario -> Medico / Paciente) en UNA tabla.
-- La columna `tipo` dice qué es cada fila; las columnas propias de un subtipo
-- aceptan NULL porque el otro subtipo no las usa.
-- ============================================================================
CREATE TABLE usuarios (
    email        VARCHAR(120) NOT NULL,
    nombre       VARCHAR(100) NOT NULL,
    password     VARCHAR(255) NOT NULL,   -- el hash de password_hash(), NUNCA la contraseña
    tipo         VARCHAR(10)  NOT NULL,   -- el discriminador de la herencia
    especialidad VARCHAR(100) NULL,       -- solo médicos
    mutualista   VARCHAR(100) NULL,       -- solo pacientes
    PRIMARY KEY (email),
    CONSTRAINT chk_usuario_tipo CHECK (tipo IN ('MEDICO', 'PACIENTE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- PRESTACIONES: la otra jerarquía (Prestacion -> Estudio / Terapia), igual.
-- El precio es DECIMAL, nunca FLOAT: con FLOAT, 0.1 + 0.2 no da 0.3.
-- La franja es el enumerado, guardado como texto legible (no como número).
-- ============================================================================
CREATE TABLE prestaciones (
    id                  INT           NOT NULL AUTO_INCREMENT,
    nombre              VARCHAR(100)  NOT NULL,
    precio              DECIMAL(10,2) NOT NULL,
    franja              VARCHAR(10)   NOT NULL,
    tipo                VARCHAR(10)   NOT NULL,
    duracion_minutos    INT           NULL,     -- solo estudios
    requiere_derivacion TINYINT(1)    NULL,     -- solo terapias (0 o 1)
    cantidad_sesiones   INT           NULL,     -- solo terapias
    PRIMARY KEY (id),
    UNIQUE KEY uq_prestacion_nombre (nombre),   -- la base también defiende la unicidad
    CONSTRAINT chk_prestacion_tipo   CHECK (tipo IN ('ESTUDIO', 'TERAPIA')),
    CONSTRAINT chk_prestacion_franja CHECK (franja IN ('MANANA', 'TARDE', 'NOCHE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- SEGUIDAS: la clase asociativa entre paciente y prestación, con su fecha.
-- El UNIQUE del par escribe en la base la regla "no seguir dos veces la misma".
-- ON DELETE CASCADE: si se elimina una prestación, sus seguidas caen solas.
-- ============================================================================
CREATE TABLE seguidas (
    id             INT          NOT NULL AUTO_INCREMENT,
    paciente_email VARCHAR(120) NOT NULL,
    prestacion_id  INT          NOT NULL,
    fecha          DATE         NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seguida (paciente_email, prestacion_id),
    CONSTRAINT fk_seguida_paciente   FOREIGN KEY (paciente_email) REFERENCES usuarios (email),
    CONSTRAINT fk_seguida_prestacion FOREIGN KEY (prestacion_id)  REFERENCES prestaciones (id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- ÓRDENES y sus LÍNEAS: la composición. Una línea no vive sin su orden
-- (ON DELETE CASCADE en la FK de la orden). Y una prestación que aparece en
-- una orden NO se puede borrar (ON DELETE RESTRICT): el historial no se toca.
--
-- precio_unitario es el precio HISTÓRICO, congelado al confirmar la orden:
-- si el precio de la prestación cambia mañana, las órdenes de ayer no cambian.
-- ============================================================================
CREATE TABLE ordenes (
    id             INT          NOT NULL AUTO_INCREMENT,
    paciente_email VARCHAR(120) NOT NULL,
    fecha          DATETIME     NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_orden_paciente FOREIGN KEY (paciente_email) REFERENCES usuarios (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lineas_orden (
    id              INT           NOT NULL AUTO_INCREMENT,
    orden_id        INT           NOT NULL,
    prestacion_id   INT           NOT NULL,
    cantidad        INT           NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_linea_orden      FOREIGN KEY (orden_id)      REFERENCES ordenes (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_linea_prestacion FOREIGN KEY (prestacion_id) REFERENCES prestaciones (id)
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
