<?php
// Carga de todas las clases del proyecto, en orden (primero los padres).
//
// Sin magia: es una lista de require_once que se lee de arriba a abajo.
// Los frameworks hacen esto con un "autoloader"; acá preferimos que se vea.

declare(strict_types=1);

// Excepciones: la base primero, después una por regla de negocio.
require_once __DIR__ . '/excepciones/ExcepcionClinica.php';
require_once __DIR__ . '/excepciones/EmailRepetidoException.php';
require_once __DIR__ . '/excepciones/CredencialesInvalidasException.php';
require_once __DIR__ . '/excepciones/PrestacionRepetidaException.php';
require_once __DIR__ . '/excepciones/PrestacionInexistenteException.php';
require_once __DIR__ . '/excepciones/PrestacionEnOrdenException.php';
require_once __DIR__ . '/excepciones/SeguidaRepetidaException.php';
require_once __DIR__ . '/excepciones/OrdenVaciaException.php';

// Dominio: las clases abstractas antes que sus hijas.
require_once __DIR__ . '/dominio/Franja.php';
require_once __DIR__ . '/dominio/Usuario.php';
require_once __DIR__ . '/dominio/Medico.php';
require_once __DIR__ . '/dominio/Paciente.php';
require_once __DIR__ . '/dominio/Prestacion.php';
require_once __DIR__ . '/dominio/Estudio.php';
require_once __DIR__ . '/dominio/Terapia.php';
require_once __DIR__ . '/dominio/Seguido.php';
require_once __DIR__ . '/dominio/LineaOrden.php';
require_once __DIR__ . '/dominio/OrdenMedica.php';

// Repositorios: todo el SQL vive acá.
require_once __DIR__ . '/repositorios/RepositorioUsuarios.php';
require_once __DIR__ . '/repositorios/RepositorioPrestaciones.php';
require_once __DIR__ . '/repositorios/RepositorioSeguidas.php';
require_once __DIR__ . '/repositorios/RepositorioOrdenes.php';

// Servicios: las reglas de negocio.
require_once __DIR__ . '/servicios/ServicioUsuarios.php';
require_once __DIR__ . '/servicios/ServicioPrestaciones.php';
require_once __DIR__ . '/servicios/ServicioSeguidas.php';
require_once __DIR__ . '/servicios/ServicioOrdenes.php';
