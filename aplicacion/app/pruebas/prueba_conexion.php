<?php
// La prueba de humo: ejercita todas las capas SIN navegador.
//
//     docker compose exec web php /var/www/app/pruebas/prueba_conexion.php
//
// Requiere haber corrido antes datos_iniciales.php. Imprime un ✔ por paso;
// si algo no da, corta con ✘ y sale con código distinto de cero.
//
// Es la forma rápida de saber si el problema está en la lógica o en las páginas:
// si esto pasa, las capas de abajo funcionan.

declare(strict_types=1);

error_reporting(E_ALL);
const BD_HOST     = 'db';
const BD_NOMBRE   = 'clinica';
const BD_USUARIO  = 'clinica';
const BD_PASSWORD = 'clinica';

require __DIR__ . '/../cargador.php';
require __DIR__ . '/../conexion.php';

$paso = 0;

function ok(string $mensaje): void
{
    global $paso;
    $paso++;
    echo "  ✔ $paso. $mensaje\n";
}

function fallar(string $mensaje): never
{
    echo "  ✘ FALLÓ: $mensaje\n";
    exit(1);
}

function verificar(bool $condicion, string $mensaje): void
{
    $condicion ? ok($mensaje) : fallar($mensaje);
}

/** Verifica que $accion lance exactamente la excepción esperada. */
function debe_lanzar(string $claseEsperada, callable $accion, string $mensaje): void
{
    try {
        $accion();
        fallar("$mensaje (no lanzó nada)");
    } catch (ExcepcionClinica $e) {
        $e instanceof $claseEsperada
            ? ok($mensaje)
            : fallar("$mensaje (lanzó " . get_class($e) . ")");
    }
}

echo "Prueba de humo de la clínica\n";

$pdo = conexion();
$usuarios      = new ServicioUsuarios(new RepositorioUsuarios($pdo));
$prestaciones  = new ServicioPrestaciones(new RepositorioPrestaciones($pdo));
$repoSeguidas  = new RepositorioSeguidas($pdo);
$seguidas      = new ServicioSeguidas($repoSeguidas, new RepositorioPrestaciones($pdo));
$ordenes       = new ServicioOrdenes(new RepositorioOrdenes($pdo), new RepositorioPrestaciones($pdo));

// --- Conexión y datos precargados ------------------------------------------
$cuenta = fn(string $tabla): int => (int) $pdo->query("SELECT COUNT(*) AS c FROM $tabla")->fetch()['c'];

verificar($cuenta('usuarios') === 3,      'Hay 3 usuarios precargados');
verificar($cuenta('prestaciones') === 8,  'Hay 8 prestaciones precargadas');
verificar($cuenta('seguidas') === 4,      'Hay 4 seguidas precargadas');
verificar($cuenta('ordenes') === 3,       'Hay 3 órdenes precargadas');

// --- Login -------------------------------------------------------------------
$admin = $usuarios->iniciarSesion('admin@mail.com', 'admin123');
verificar($admin instanceof Medico, 'El login del médico devuelve un Medico');

debe_lanzar(CredencialesInvalidasException::class,
    fn() => $usuarios->iniciarSesion('admin@mail.com', 'incorrecta'),
    'Contraseña incorrecta lanza CredencialesInvalidasException');

debe_lanzar(EmailRepetidoException::class,
    fn() => $usuarios->registrar('PACIENTE', 'ana@mail.com', 'Otra Ana', 'x123456', 'SEMM'),
    'Registrar un email repetido lanza EmailRepetidoException');

// --- Catálogo: orden y búsqueda ---------------------------------------------
$porNombre = $prestaciones->catalogo('nombre');
$porPrecio = $prestaciones->catalogo('precio');
verificar($porNombre[0]->nombre === 'Audiometría', 'Ordenado por nombre, primero Audiometría');
verificar($porPrecio[0]->nombre === 'Masoterapia', 'Ordenado por precio, primero Masoterapia ($400)');

$busqueda = $prestaciones->catalogo('nombre', 'TERA');
verificar(count($busqueda) === 3,
    'Buscar "TERA" (mayúsculas) encuentra las 3 con "tera": Fisioterapia, Masoterapia y Terapia respiratoria');

// --- Reglas del catálogo ------------------------------------------------------
debe_lanzar(PrestacionRepetidaException::class,
    fn() => $prestaciones->agregar(new Estudio(null, 'Audiometría', 100, Franja::MANANA, 10)),
    'Agregar un nombre repetido lanza PrestacionRepetidaException');

$buscarId = function (string $nombre) use ($pdo): int {
    $c = $pdo->prepare('SELECT id FROM prestaciones WHERE nombre = ?');
    $c->execute([$nombre]);
    return (int) $c->fetch()['id'];
};

debe_lanzar(PrestacionEnOrdenException::class,
    fn() => $prestaciones->eliminar($buscarId('Electrocardiograma')),
    'Eliminar una prestación que está en una orden lanza PrestacionEnOrdenException');

// La cascada: Masoterapia está SOLO en seguidas; al eliminarla, su seguida cae.
$masoterapiaId = $buscarId('Masoterapia');
$seguidasAntes = $cuenta('seguidas');
$prestaciones->eliminar($masoterapiaId);
verificar($cuenta('seguidas') === $seguidasAntes - 1,
    'Eliminar Masoterapia borra su seguida en cascada');

// La restauramos para que el mundo quede como estaba.
$nuevoId = $prestaciones->agregar(new Terapia(null, 'Masoterapia', 400, Franja::TARDE, false, 6));
$repoSeguidas->agregar('ana@mail.com', $nuevoId, date('Y-m-d', strtotime('-4 days')));
verificar($cuenta('seguidas') === $seguidasAntes, 'Masoterapia y su seguida restauradas');

// --- Seguidas -----------------------------------------------------------------
debe_lanzar(SeguidaRepetidaException::class,
    fn() => $seguidas->agregar('ana@mail.com', $nuevoId),
    'Seguir dos veces la misma prestación lanza SeguidaRepetidaException');

// --- Órdenes -------------------------------------------------------------------
debe_lanzar(OrdenVaciaException::class,
    fn() => $ordenes->confirmar('ana@mail.com', []),
    'Confirmar una solicitud vacía lanza OrdenVaciaException');

$historial = $ordenes->historial('ana@mail.com');
verificar(count($historial) === 2, 'Ana tiene 2 órdenes en el historial');
verificar($historial[0]->fecha > $historial[1]->fecha, 'El historial viene con la más reciente primero');

// El precio histórico: en la orden vieja, el electrocardiograma está a $1000
// aunque hoy cueste $1200.
$ordenVieja = $historial[1];
$lineaElectro = null;
foreach ($ordenVieja->lineas as $linea) {
    if ($linea->prestacionNombre === 'Electrocardiograma') {
        $lineaElectro = $linea;
    }
}
verificar($lineaElectro !== null && $lineaElectro->precioUnitario === 1000.0,
    'La orden vieja conserva el precio histórico ($1000, no $1200)');

$electroActual = $prestaciones->detalle($buscarId('Electrocardiograma'));
verificar($electroActual->precio === 1200.0, 'El precio actual del electrocardiograma es $1200');

echo "\nTODO OK — $paso pruebas pasaron.\n";
