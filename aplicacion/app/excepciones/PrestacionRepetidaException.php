<?php
declare(strict_types=1);

class PrestacionRepetidaException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('Ya existe una prestación con ese nombre.');
    }
}
