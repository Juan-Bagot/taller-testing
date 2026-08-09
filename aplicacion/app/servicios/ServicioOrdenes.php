<?php
// Las reglas de negocio de las órdenes médicas.

declare(strict_types=1);

class ServicioOrdenes
{
    public function __construct(
        private RepositorioOrdenes $ordenes,
        private RepositorioPrestaciones $prestaciones,
    ) {
    }

    /**
     * Confirma la solicitud del paciente: la convierte en una orden médica.
     *
     * El carrito llega tal como vive en la sesión: [prestacion_id => cantidad].
     * Los precios se RELEEN de la base acá, uno por uno: jamás se acepta un
     * precio que venga del navegador, porque cualquiera puede editar un formulario.
     *
     * @param array<int, int> $carrito
     */
    public function confirmar(string $email, array $carrito): int
    {
        $lineas = [];
        foreach ($carrito as $prestacionId => $cantidad) {
            $prestacion = $this->prestaciones->buscarPorId((int) $prestacionId);
            if ($prestacion === null || (int) $cantidad < 1) {
                continue;   // una prestación borrada mientras tanto no voltea la orden
            }
            $lineas[] = ['prestacion' => $prestacion, 'cantidad' => (int) $cantidad];
        }

        if ($lineas === []) {
            throw new OrdenVaciaException();
        }

        // La transacción (todo o nada) es mecánica de persistencia: vive en el repositorio.
        return $this->ordenes->crear($email, $lineas);
    }

    /** @return OrdenMedica[] las más recientes primero */
    public function historial(string $email): array
    {
        return $this->ordenes->listarDePaciente($email);
    }
}
