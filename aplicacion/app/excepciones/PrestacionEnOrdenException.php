<?php
declare(strict_types=1);

class PrestacionEnOrdenException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('No se puede eliminar: la prestación aparece en una orden médica.');
    }
}
