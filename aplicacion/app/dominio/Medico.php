<?php
declare(strict_types=1);

class Medico extends Usuario
{
    public function __construct(
        string $email,
        string $nombre,
        string $password,
        public readonly string $especialidad,
    ) {
        parent::__construct($email, $nombre, $password);
    }

    public function tipo(): string
    {
        return 'MEDICO';
    }
}
