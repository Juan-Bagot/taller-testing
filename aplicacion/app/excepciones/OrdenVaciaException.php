<?php
declare(strict_types=1);

class OrdenVaciaException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('La solicitud está vacía: agregá al menos una prestación.');
    }
}
