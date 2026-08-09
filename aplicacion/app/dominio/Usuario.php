<?php
// La raíz de la jerarquía de usuarios. Es abstracta: nadie es "Usuario a secas",
// cada fila de la base es un Medico o un Paciente.
//
// Las propiedades son public readonly: se leen directo ($usuario->nombre) pero
// no se pueden modificar después de construir el objeto.

declare(strict_types=1);

abstract class Usuario
{
    public function __construct(
        public readonly string $email,
        public readonly string $nombre,
        public readonly string $password,   // el HASH, nunca la contraseña en claro
    ) {
    }

    /** Lo que va a la columna `tipo` de la base. */
    abstract public function tipo(): string;
}
