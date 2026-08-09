<?php
// El bootstrap de la mini-API JSON. Cada endpoint de api/ lo incluye primero.
//
// La API reusa TODO lo existente: el mismo config.php (sesión por cookie, igual
// que la web), los mismos servicios y las mismas excepciones. Lo único nuevo es
// la forma de responder: JSON con códigos de estado, en lugar de HTML con redirects.
//
// Convención de respuesta:
//   éxito → { "ok": true,  "datos": ... }
//   error → { "ok": false, "error": { "codigo": "...", "mensaje": "..." } }

declare(strict_types=1);

require __DIR__ . '/../../app/config.php';
require_once __DIR__ . '/../../app/prestacion_desde_formulario.php';

/** Responde JSON con el estado dado y termina. */
function responder(int $estado, array $cuerpo): never
{
    http_response_code($estado);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function responder_error(int $estado, string $codigo, string $mensaje): never
{
    responder($estado, ['ok' => false, 'error' => ['codigo' => $codigo, 'mensaje' => $mensaje]]);
}

/** Lee y decodifica el cuerpo JSON del request; 400 si no es JSON válido. */
function leer_json(): array
{
    $crudo = file_get_contents('php://input');
    $datos = json_decode($crudo, true);
    if (!is_array($datos)) {
        responder_error(400, 'JSON_INVALIDO', 'El cuerpo del request no es JSON válido.');
    }
    return $datos;
}

/** 405 con el header Allow, para métodos no soportados. */
function metodo_no_permitido(string $permitidos): never
{
    header('Allow: ' . $permitidos);
    responder_error(405, 'METODO_NO_PERMITIDO', "Método no permitido. Permitidos: $permitidos.");
}

// ---------------------------------------------------------------------------
// Control de acceso, versión API: las mismas preguntas que sesion.php, pero
// respondiendo códigos de estado en lugar de redirigir (la web habla con un
// navegador; la API habla con un programa).
// ---------------------------------------------------------------------------

function requerir_sesion_api(): void
{
    if (!hay_sesion()) {
        responder_error(401, 'NO_AUTENTICADO', 'Tenés que iniciar sesión (POST /api/login.php).');
    }
}

function requerir_medico_api(): void
{
    requerir_sesion_api();
    if (!es_medico()) {
        responder_error(403, 'SOLO_MEDICO', 'Esa operación es solo para médicos.');
    }
}

// ---------------------------------------------------------------------------
// Traducciones entre el dominio y JSON
// ---------------------------------------------------------------------------

/** Qué estado HTTP y código corresponde a cada excepción de negocio. */
function estado_http_de(ExcepcionClinica $e): array
{
    return match ($e::class) {
        CredencialesInvalidasException::class => [401, 'CREDENCIALES_INVALIDAS'],
        PrestacionInexistenteException::class => [404, 'NO_EXISTE'],
        PrestacionRepetidaException::class    => [409, 'NOMBRE_REPETIDO'],
        PrestacionEnOrdenException::class     => [409, 'EN_ORDEN'],
        default                               => [400, 'VALIDACION'],
    };
}

/** Serializa una prestación: los campos del subtipo solo si corresponden. */
function prestacion_a_json(Prestacion $p): array
{
    $json = [
        'id'     => $p->id,
        'nombre' => $p->nombre,
        'precio' => $p->precio,
        'franja' => $p->franja->value,
        'tipo'   => $p->tipo(),
    ];
    if ($p instanceof Estudio) {
        $json['duracion_minutos'] = $p->duracionMinutos;
    }
    if ($p instanceof Terapia) {
        $json['requiere_derivacion'] = $p->requiereDerivacion;
        $json['cantidad_sesiones']   = $p->cantidadSesiones;
    }
    return $json;
}

/**
 * Convierte el cuerpo JSON en una Prestacion, reusando el conversor de la web.
 * Único ajuste: prestacion_desde_formulario decide la derivación con isset()
 * (viene de formularios con checkbox); en JSON "requiere_derivacion": false
 * debe contar como NO — por eso se normaliza con empty() antes de delegar.
 */
function prestacion_desde_json(array $datos, ?int $id = null): Prestacion
{
    // El formulario web manda siempre valores válidos (los selects son fijos);
    // un JSON puede mandar cualquier cosa, así que acá SÍ se valida.
    if (!in_array($datos['tipo'] ?? '', ['ESTUDIO', 'TERAPIA'], true)) {
        throw new ExcepcionClinica('El tipo tiene que ser ESTUDIO o TERAPIA.');
    }
    if (Franja::tryFrom($datos['franja'] ?? '') === null) {
        throw new ExcepcionClinica('La franja tiene que ser MANANA, TARDE o NOCHE.');
    }

    if (empty($datos['requiere_derivacion'])) {
        unset($datos['requiere_derivacion']);
    }
    return prestacion_desde_formulario($datos, $id);
}
