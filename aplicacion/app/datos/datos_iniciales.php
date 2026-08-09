<?php
// Los datos de ejemplo, para poder probar todo sin cargar nada a mano.
//
// Se ejecuta por línea de comandos, con el contenedor levantado:
//     docker compose exec web php /var/www/app/datos/datos_iniciales.php
//
// Es IDEMPOTENTE: si ya hay usuarios, no toca nada. Para volver a cero:
//     docker compose down -v && docker compose up -d   (y correr esto de nuevo)
//
// Los usuarios se crean A TRAVÉS DEL SERVICIO, para que las contraseñas queden
// hasheadas exactamente igual que en un registro real. Las órdenes se insertan
// con SQL directo, porque necesitamos fecharlas en el pasado y congelar un
// precio histórico distinto del actual — cosas que el servicio (con razón) no permite.

declare(strict_types=1);

// Este script corre por CLI, sin sesión web: solo necesita config sin session_start.
error_reporting(E_ALL);
const BD_HOST     = 'db';
const BD_NOMBRE   = 'clinica';
const BD_USUARIO  = 'clinica';
const BD_PASSWORD = 'clinica';

require __DIR__ . '/../cargador.php';
require __DIR__ . '/../conexion.php';

$pdo = conexion();

// ---------------------------------------------------------------------------
// Idempotencia: si ya hay datos, no hacemos nada.
// ---------------------------------------------------------------------------
if ($pdo->query('SELECT COUNT(*) AS c FROM usuarios')->fetch()['c'] > 0) {
    echo "Ya había datos: no se tocó nada.\n";
    exit(0);
}

// ---------------------------------------------------------------------------
// Usuarios (vía servicio: hashes reales)
// ---------------------------------------------------------------------------
$servicioUsuarios = new ServicioUsuarios(new RepositorioUsuarios($pdo));

$servicioUsuarios->registrar('MEDICO',   'admin@mail.com', 'Dra. Admin', 'admin123', 'Medicina General');
$servicioUsuarios->registrar('PACIENTE', 'ana@mail.com',   'Ana García', 'ana123',   'SEMM');
$servicioUsuarios->registrar('PACIENTE', 'luis@mail.com',  'Luis Pérez', 'luis123',  'CASMU');

// ---------------------------------------------------------------------------
// Prestaciones (vía servicio). El orden alfabético NO coincide con el orden
// por precio, a propósito: así se ve que "ordenar" ordena de verdad.
// ---------------------------------------------------------------------------
$servicioPrestaciones = new ServicioPrestaciones(new RepositorioPrestaciones($pdo));

$ids = [];
$agregar = function (Prestacion $p) use ($servicioPrestaciones, &$ids): void {
    $ids[$p->nombre] = $servicioPrestaciones->agregar($p);
};

//        nombre                        precio  franja          datos del subtipo
$agregar(new Estudio(null, 'Audiometría',             700, Franja::MANANA, 20));
$agregar(new Estudio(null, 'Ecografía abdominal',    1800, Franja::TARDE,  30));
$agregar(new Estudio(null, 'Electrocardiograma',     1200, Franja::NOCHE,  10));
$agregar(new Estudio(null, 'Radiografía de tórax',    950, Franja::MANANA, 15));
$agregar(new Terapia(null, 'Fisioterapia de rodilla', 850, Franja::TARDE,  true,  10));
$agregar(new Terapia(null, 'Fonoaudiología',          600, Franja::MANANA, false,  8));
$agregar(new Terapia(null, 'Masoterapia',             400, Franja::TARDE,  false,  6));
$agregar(new Terapia(null, 'Terapia respiratoria',   1500, Franja::NOCHE,  true,   5));

// ---------------------------------------------------------------------------
// Seguidas. Masoterapia queda SOLO en seguidas (y en ninguna orden): es la que
// prueba que al eliminarla, la seguida cae en cascada.
// ---------------------------------------------------------------------------
$repoSeguidas = new RepositorioSeguidas($pdo);

$repoSeguidas->agregar('ana@mail.com',  $ids['Fonoaudiología'],       date('Y-m-d', strtotime('-8 days')));
$repoSeguidas->agregar('ana@mail.com',  $ids['Masoterapia'],          date('Y-m-d', strtotime('-4 days')));
$repoSeguidas->agregar('ana@mail.com',  $ids['Radiografía de tórax'], date('Y-m-d', strtotime('-1 day')));
$repoSeguidas->agregar('luis@mail.com', $ids['Terapia respiratoria'], date('Y-m-d', strtotime('-3 days')));

// ---------------------------------------------------------------------------
// Órdenes, con SQL directo para poder fecharlas en el pasado.
//
// La orden VIEJA de Ana tiene el Electrocardiograma a $1000: su precio
// histórico. El precio actual es $1200 — el historial no cambia.
// ---------------------------------------------------------------------------
function insertar_orden(PDO $pdo, string $email, string $fecha, array $lineas): void
{
    $pdo->prepare('INSERT INTO ordenes (paciente_email, fecha) VALUES (?, ?)')
        ->execute([$email, $fecha]);
    $ordenId = (int) $pdo->lastInsertId();

    $consulta = $pdo->prepare(
        'INSERT INTO lineas_orden (orden_id, prestacion_id, cantidad, precio_unitario)
         VALUES (?, ?, ?, ?)'
    );
    foreach ($lineas as [$prestacionId, $cantidad, $precio]) {
        $consulta->execute([$ordenId, $prestacionId, $cantidad, $precio]);
    }
}

// Ana, hace 10 días: el electrocardiograma costaba $1000 (hoy cuesta $1200).
insertar_orden($pdo, 'ana@mail.com', date('Y-m-d H:i:s', strtotime('-10 days')), [
    [$ids['Electrocardiograma'], 1, 1000],
    [$ids['Fisioterapia de rodilla'], 1, 850],
]);

// Ana, hace 2 días.
insertar_orden($pdo, 'ana@mail.com', date('Y-m-d H:i:s', strtotime('-2 days')), [
    [$ids['Ecografía abdominal'], 1, 1800],
]);

// Luis, hace 5 días.
insertar_orden($pdo, 'luis@mail.com', date('Y-m-d H:i:s', strtotime('-5 days')), [
    [$ids['Radiografía de tórax'], 2, 950],
]);

echo "Datos cargados.\n";
echo "  Médico:    admin@mail.com / admin123\n";
echo "  Pacientes: ana@mail.com / ana123  ·  luis@mail.com / luis123\n";
echo "  8 prestaciones, 4 seguidas, 3 órdenes.\n";
