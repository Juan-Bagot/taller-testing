<?php
// Las reglas de negocio de las seguidas.

declare(strict_types=1);

class ServicioSeguidas
{
    public function __construct(
        private RepositorioSeguidas $seguidas,
        private RepositorioPrestaciones $prestaciones,
    ) {
    }

    /** @return Seguido[] */
    public function listar(string $email): array
    {
        return $this->seguidas->listarDePaciente($email);
    }

    public function agregar(string $email, int $prestacionId): void
    {
        // Que la prestación exista...
        if ($this->prestaciones->buscarPorId($prestacionId) === null) {
            throw new PrestacionInexistenteException();
        }
        // ...y que no la esté siguiendo ya.
        if ($this->seguidas->existe($email, $prestacionId)) {
            throw new SeguidaRepetidaException();
        }
        $this->seguidas->agregar($email, $prestacionId, date('Y-m-d'));
    }

    public function quitar(string $email, int $prestacionId): void
    {
        $this->seguidas->quitar($email, $prestacionId);
    }
}
