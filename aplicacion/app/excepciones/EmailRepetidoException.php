<?php
declare(strict_types=1);

class EmailRepetidoException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('Ya existe un usuario con ese email.');
    }
}
