<?php
// La madre de todas las excepciones de negocio del proyecto.
//
// Las páginas atrapan ESTA (catch (ExcepcionClinica $e)) y muestran su mensaje
// como flash: así un solo catch cubre todas las reglas, y los errores de
// programación (que NO extienden de esta) no se disfrazan de mensajes amigables.

declare(strict_types=1);

class ExcepcionClinica extends Exception
{
}
