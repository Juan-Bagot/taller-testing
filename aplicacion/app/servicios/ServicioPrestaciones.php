<?php
// Las reglas de negocio del catálogo.

declare(strict_types=1);

class ServicioPrestaciones
{
    public function __construct(private RepositorioPrestaciones $prestaciones)
    {
    }

    /** El catálogo, opcionalmente filtrado por texto y ordenado. */
    public function catalogo(string $orden = 'nombre', string $buscar = ''): array
    {
        return $buscar === ''
            ? $this->prestaciones->listar($orden)
            : $this->prestaciones->buscarPorNombre($buscar, $orden);
    }

    public function detalle(int $id): Prestacion
    {
        $prestacion = $this->prestaciones->buscarPorId($id);
        if ($prestacion === null) {
            throw new PrestacionInexistenteException();
        }
        return $prestacion;
    }

    public function agregar(Prestacion $prestacion): int
    {
        $this->validar($prestacion);
        if ($this->prestaciones->existeNombre($prestacion->nombre)) {
            throw new PrestacionRepetidaException();
        }
        return $this->prestaciones->insertar($prestacion);
    }

    public function modificar(Prestacion $prestacion): void
    {
        $this->validar($prestacion);
        // Que exista lo que se está editando...
        $this->detalle($prestacion->id);
        // ...y que el nombre nuevo no choque con OTRA prestación.
        if ($this->prestaciones->existeNombre($prestacion->nombre, $prestacion->id)) {
            throw new PrestacionRepetidaException();
        }
        $this->prestaciones->actualizar($prestacion);
    }

    /**
     * La regla de la eliminación: si aparece en una orden médica, no se toca
     * (el historial no se reescribe). Si nunca fue ordenada, se elimina, y sus
     * seguidas caen solas (la FK con CASCADE).
     */
    public function eliminar(int $id): void
    {
        $this->detalle($id);
        if ($this->prestaciones->estaEnAlgunaOrden($id)) {
            throw new PrestacionEnOrdenException();
        }
        $this->prestaciones->eliminar($id);
    }

    private function validar(Prestacion $prestacion): void
    {
        if ($prestacion->nombre === '') {
            throw new ExcepcionClinica('El nombre no puede estar vacío.');
        }
        if ($prestacion->precio <= 0) {
            throw new ExcepcionClinica('El precio tiene que ser mayor que cero.');
        }
    }
}
