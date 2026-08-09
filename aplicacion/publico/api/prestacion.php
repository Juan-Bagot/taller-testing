<?php
// /api/prestacion.php?id=N — una prestación puntual.
//
//   GET    (público)  el detalle.
//   PUT    (médico)   la modifica (el tipo no se puede cambiar).
//   DELETE (médico)   la elimina (falla si aparece en una orden médica).

declare(strict_types=1);

require __DIR__ . '/_api.php';

if (!isset($_GET['id']) || !ctype_digit($_GET['id'])) {
    responder_error(400, 'VALIDACION', 'Falta el parámetro id (entero).');
}
$id = (int) $_GET['id'];

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

try {
    switch ($_SERVER['REQUEST_METHOD']) {

        case 'GET':
            responder(200, ['ok' => true, 'datos' => prestacion_a_json($servicio->detalle($id))]);

        case 'PUT':
            requerir_medico_api();
            // El tipo no se convierte: tiene que coincidir con el actual.
            $actual = $servicio->detalle($id);
            $datos = leer_json();
            if (($datos['tipo'] ?? '') !== $actual->tipo()) {
                responder_error(400, 'VALIDACION',
                    'El tipo no se puede cambiar: esta prestación es ' . $actual->tipo() . '.');
            }
            $servicio->modificar(prestacion_desde_json($datos, $id));
            responder(200, ['ok' => true, 'datos' => prestacion_a_json($servicio->detalle($id))]);

        case 'DELETE':
            requerir_medico_api();
            $servicio->eliminar($id);
            responder(200, ['ok' => true, 'datos' => ['id' => $id, 'eliminada' => true]]);

        default:
            metodo_no_permitido('GET, PUT, DELETE');
    }
} catch (ExcepcionClinica $e) {
    [$estado, $codigo] = estado_http_de($e);
    responder_error($estado, $codigo, $e->getMessage());
}
