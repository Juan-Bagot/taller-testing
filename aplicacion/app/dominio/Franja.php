<?php
// El enumerado: los tres valores posibles de la franja horaria de una prestación.
// En PHP es un enum de verdad; en la base se guarda como texto (el ->value).

declare(strict_types=1);

enum Franja: string
{
    case MANANA = 'MANANA';
    case TARDE  = 'TARDE';
    case NOCHE  = 'NOCHE';

    /** Cómo se muestra en pantalla (el valor de la base no lleva acentos). */
    public function etiqueta(): string
    {
        return match ($this) {
            Franja::MANANA => 'Mañana',
            Franja::TARDE  => 'Tarde',
            Franja::NOCHE  => 'Noche',
        };
    }
}
