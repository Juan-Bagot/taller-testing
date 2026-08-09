<?php
// La clase asociativa: un paciente sigue una prestación desde una fecha.

declare(strict_types=1);

class Seguido
{
    public function __construct(
        public readonly int $id,
        public readonly string $pacienteEmail,
        public readonly Prestacion $prestacion,
        public readonly string $fecha,          // 'YYYY-MM-DD'
    ) {
    }
}
