<?php
// Una línea de una orden médica. Guarda el NOMBRE de la prestación y el precio
// del momento de la orden: el historial muestra lo que se ordenó, aunque la
// prestación cambie de precio (o de nombre) después.

declare(strict_types=1);

class LineaOrden
{
    public function __construct(
        public readonly int $id,
        public readonly string $prestacionNombre,
        public readonly int $cantidad,
        public readonly float $precioUnitario,   // el precio HISTÓRICO
    ) {
    }

    public function subtotal(): float
    {
        return $this->cantidad * $this->precioUnitario;
    }
}
