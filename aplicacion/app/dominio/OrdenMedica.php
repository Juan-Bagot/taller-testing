<?php
// La orden médica con sus líneas: la composición del modelo.

declare(strict_types=1);

class OrdenMedica
{
    /** @param LineaOrden[] $lineas */
    public function __construct(
        public readonly int $id,
        public readonly string $pacienteEmail,
        public readonly string $fecha,           // 'YYYY-MM-DD HH:MM:SS'
        public readonly array $lineas,
    ) {
    }

    public function total(): float
    {
        $total = 0.0;
        foreach ($this->lineas as $linea) {
            $total += $linea->subtotal();
        }
        return $total;
    }
}
