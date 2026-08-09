<?php
declare(strict_types=1);

class SeguidaRepetidaException extends ExcepcionClinica
{
    public function __construct()
    {
        parent::__construct('Ya estás siguiendo esa prestación.');
    }
}
