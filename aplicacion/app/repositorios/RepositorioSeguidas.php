<?php
// Todo el SQL de las seguidas (la clase asociativa paciente–prestación).

declare(strict_types=1);

class RepositorioSeguidas
{
    public function __construct(private PDO $pdo)
    {
    }

    /**
     * Las seguidas de un paciente, con su prestación adentro: el JOIN trae
     * las dos tablas de una vez y desdeFila arma el par de objetos.
     * @return Seguido[]
     */
    public function listarDePaciente(string $email): array
    {
        $consulta = $this->pdo->prepare(
            'SELECT s.id AS seguida_id, s.fecha AS seguida_fecha, p.*
             FROM seguidas s
             JOIN prestaciones p ON p.id = s.prestacion_id
             WHERE s.paciente_email = ?
             ORDER BY s.fecha DESC, p.nombre'
        );
        $consulta->execute([$email]);

        $seguidas = [];
        foreach ($consulta->fetchAll() as $fila) {
            $seguidas[] = new Seguido(
                (int) $fila['seguida_id'],
                $email,
                $this->prestacionDesdeFila($fila),
                $fila['seguida_fecha'],
            );
        }
        return $seguidas;
    }

    public function existe(string $email, int $prestacionId): bool
    {
        $consulta = $this->pdo->prepare(
            'SELECT 1 FROM seguidas WHERE paciente_email = ? AND prestacion_id = ?'
        );
        $consulta->execute([$email, $prestacionId]);
        return $consulta->fetch() !== false;
    }

    public function agregar(string $email, int $prestacionId, string $fecha): void
    {
        $consulta = $this->pdo->prepare(
            'INSERT INTO seguidas (paciente_email, prestacion_id, fecha) VALUES (?, ?, ?)'
        );
        $consulta->execute([$email, $prestacionId, $fecha]);
    }

    public function quitar(string $email, int $prestacionId): void
    {
        $consulta = $this->pdo->prepare(
            'DELETE FROM seguidas WHERE paciente_email = ? AND prestacion_id = ?'
        );
        $consulta->execute([$email, $prestacionId]);
    }

    private function prestacionDesdeFila(array $fila): Prestacion
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
