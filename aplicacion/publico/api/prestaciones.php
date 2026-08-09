<?php
// /api/prestaciones.php — la colección de prestaciones.
//
//   GET  (público)  lista el catálogo. Query: orden=nombre|precio, buscar=texto.
//   POST (médico)   crea una prestación. Cuerpo: el JSON de una prestación.

declare(strict_types=1);

require __DIR__ . '/_api.php';

$servicio = new ServicioPrestaciones(new RepositorioPrestaciones(conexion()));

switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        $orden = $_GET['orden'] ?? 'nombre';
        if (!in_array($orden, ['nombre', 'precio'], true)) {
            responder_error(400, 'VALIDACION', 'El orden tiene que ser "nombre" o "precio".');
        }

        $prestaciones = $servicio->catalogo($orden, trim($_GET['buscar'] ?? ''));
        responder(200, ['ok' => true, 'datos' => array_map('prestacion_a_json', $prestaciones)]);

    case 'POST':
        requerir_medico_api();

        $datos = leer_json();
        try {
            $id = $servicio->agregar(prestacion_desde_json($datos));
            header('Location: prestacion.php?id=' . $id);
            responder(201, ['ok' => true, 'datos' => prestacion_a_json($servicio->detalle($id))]);
        } catch (ExcepcionClinica $e) {
            [$estado, $codigo] = estado_http_de($e);
            responder_error($estado, $codigo, $e->getMessage());
        }

    default:
        metodo_no_permitido('GET, POST');
}
