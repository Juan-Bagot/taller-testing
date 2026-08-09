<?php
declare(strict_types=1);

class CredencialesInvalidasException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('Email o contraseña incorrectos.');
    }
}
