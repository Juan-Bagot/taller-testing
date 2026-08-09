<?php
declare(strict_types=1);

class PrestacionInexistenteException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('No existe esa prestación.');
    }
}
