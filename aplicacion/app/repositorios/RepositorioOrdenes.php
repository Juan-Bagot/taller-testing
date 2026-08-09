<?php
// Todo el SQL de las órdenes médicas. Acá vive LA transacción del proyecto:
// una orden con sus líneas se guarda entera o no se guarda nada.

declare(strict_types=1);

class RepositorioOrdenes
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * Crea la orden y todas sus líneas, en una transacción: si cualquier INSERT
     * falla, el rollBack deshace todo. Nunca queda una orden por la mitad.
     *
     * @param array<int, array{prestacion: Prestacion, cantidad: int}> $lineas
     */
    public function crear(string $pacienteEmail, array $lineas): int
    {
        $this->pdo->beginTransaction();

        try {
            $consulta = $this->pdo->prepare(
                'INSERT INTO ordenes (paciente_email, fecha) VALUES (?, NOW())'
            );
            $consulta->execute([$pacienteEmail]);
            $ordenId = (int) $this->pdo->lastInsertId();

            $lineaConsulta = $this->pdo->prepare(
                'INSERT INTO lineas_orden (orden_id, prestacion_id, cantidad, precio_unitario)
                 VALUES (?, ?, ?, ?)'
            );
            foreach ($lineas as $linea) {
                // El precio se CONGELA acá: es el de la prestación en este momento.
                $lineaConsulta->execute([
                    $ordenId,
                    $linea['prestacion']->id,
                    $linea['cantidad'],
                    $linea['prestacion']->precio,
                ]);
            }

            $this->pdo->commit();
            return $ordenId;

        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * El historial de un paciente: las órdenes más recientes primero, cada una
     * con sus líneas (el orden lo resuelve la consulta, no PHP).
     * @return OrdenMedica[]
     */
    public function listarDePaciente(string $email): array
    {
        $consulta = $this->pdo->prepare(
            'SELECT o.id AS orden_id, o.fecha AS orden_fecha,
                    l.id AS linea_id, l.cantidad, l.precio_unitario,
                    p.nombre AS prestacion_nombre
             FROM ordenes o
             JOIN lineas_orden l ON l.orden_id = o.id
             JOIN prestaciones p ON p.id = l.prestacion_id
             WHERE o.paciente_email = ?
             ORDER BY o.fecha DESC, o.id DESC, p.nombre'
        );
        $consulta->execute([$email]);

        // Las filas vienen "planas" (una por línea); se agrupan por orden.
        $porOrden = [];
        foreach ($consulta->fetchAll() as $fila) {
            $porOrden[$fila['orden_id']]['fecha'] = $fila['orden_fecha'];
            $porOrden[$fila['orden_id']]['lineas'][] = new LineaOrden(
                (int) $fila['linea_id'],
                $fila['prestacion_nombre'],
                (int) $fila['cantidad'],
                (float) $fila['precio_unitario'],
            );
        }

        $ordenes = [];
        foreach ($porOrden as $id => $datos) {
            $ordenes[] = new OrdenMedica($id, $email, $datos['fecha'], $datos['lineas']);
        }
        return $ordenes;
    }
}
