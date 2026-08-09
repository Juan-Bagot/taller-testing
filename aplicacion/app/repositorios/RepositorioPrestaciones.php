<?php
// Todo el SQL del catálogo de prestaciones.

declare(strict_types=1);

class RepositorioPrestaciones
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * El catálogo, ordenado. El nombre de la columna NO puede ser un parámetro
     * de un prepared statement (los parámetros son valores, no partes del SQL),
     * así que se resuelve con una LISTA BLANCA: solo puede ser una de estas dos.
     */
    public function listar(string $orden = 'nombre'): array
    {
        $columna = $orden === 'precio' ? 'precio' : 'nombre';

        $consulta = $this->pdo->query("SELECT * FROM prestaciones ORDER BY $columna");
        return array_map($this->desdeFila(...), $consulta->fetchAll());
    }

    /**
     * Búsqueda por parte del nombre, sin distinguir mayúsculas.
     * Los comodines % se arman en PHP y viajan COMO PARÁMETRO: el texto del
     * usuario nunca toca el SQL.
     */
    public function buscarPorNombre(string $texto, string $orden = 'nombre'): array
    {
        $columna = $orden === 'precio' ? 'precio' : 'nombre';

        $consulta = $this->pdo->prepare(
            "SELECT * FROM prestaciones
             WHERE LOWER(nombre) LIKE LOWER(?)
             ORDER BY $columna"
        );
        $consulta->execute(['%' . $texto . '%']);
        return array_map($this->desdeFila(...), $consulta->fetchAll());
    }

    public function buscarPorId(int $id): ?Prestacion
    {
        $consulta = $this->pdo->prepare('SELECT * FROM prestaciones WHERE id = ?');
        $consulta->execute([$id]);

        $fila = $consulta->fetch();
        return $fila === false ? null : $this->desdeFila($fila);
    }

    /** Para el alta ($exceptoId = null) y para la edición (sin chocar consigo misma). */
    public function existeNombre(string $nombre, ?int $exceptoId = null): bool
    {
        if ($exceptoId === null) {
            $consulta = $this->pdo->prepare('SELECT 1 FROM prestaciones WHERE nombre = ?');
            $consulta->execute([$nombre]);
        } else {
            $consulta = $this->pdo->prepare('SELECT 1 FROM prestaciones WHERE nombre = ? AND id <> ?');
            $consulta->execute([$nombre, $exceptoId]);
        }
        return $consulta->fetch() !== false;
    }

    public function insertar(Prestacion $prestacion): int
    {
        $consulta = $this->pdo->prepare(
            'INSERT INTO prestaciones
                 (nombre, precio, franja, tipo, duracion_minutos, requiere_derivacion, cantidad_sesiones)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $consulta->execute($this->columnas($prestacion));

        return (int) $this->pdo->lastInsertId();
    }

    public function actualizar(Prestacion $prestacion): void
    {
        $consulta = $this->pdo->prepare(
            'UPDATE prestaciones
             SET nombre = ?, precio = ?, franja = ?, tipo = ?,
                 duracion_minutos = ?, requiere_derivacion = ?, cantidad_sesiones = ?
             WHERE id = ?'
        );
        $consulta->execute([...$this->columnas($prestacion), $prestacion->id]);
    }

    /** Las seguidas caen solas: la FK tiene ON DELETE CASCADE. */
    public function eliminar(int $id): void
    {
        $consulta = $this->pdo->prepare('DELETE FROM prestaciones WHERE id = ?');
        $consulta->execute([$id]);
    }

    /** ¿Aparece en alguna orden médica? (si sí, no se puede eliminar). */
    public function estaEnAlgunaOrden(int $id): bool
    {
        $consulta = $this->pdo->prepare('SELECT 1 FROM lineas_orden WHERE prestacion_id = ? LIMIT 1');
        $consulta->execute([$id]);
        return $consulta->fetch() !== false;
    }

    /** Los valores de las 7 columnas, en el orden del INSERT/UPDATE. */
    private function columnas(Prestacion $p): array
    {
        return [
            $p->nombre,
            $p->precio,
            $p->franja->value,      // el enum, a texto
            $p->tipo(),
            $p instanceof Estudio ? $p->duracionMinutos : null,
            $p instanceof Terapia ? (int) $p->requiereDerivacion : null,
            $p instanceof Terapia ? $p->cantidadSesiones : null,
        ];
    }

    /** La columna `tipo` decide el subtipo; la franja vuelve de texto a enum. */
    private function desdeFila(array $fila): Prestacion
    {
        $franja = Franja::from($fila['franja']);

        return match ($fila['tipo']) {
            'ESTUDIO' => new Estudio(
                (int) $fila['id'], $fila['nombre'], (float) $fila['precio'], $franja,
                (int) $fila['duracion_minutos']
            ),
            'TERAPIA' => new Terapia(
                (int) $fila['id'], $fila['nombre'], (float) $fila['precio'], $franja,
                (bool) $fila['requiere_derivacion'], (int) $fila['cantidad_sesiones']
            ),
        };
    }
}
