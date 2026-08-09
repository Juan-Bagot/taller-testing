<?php
// Todo el SQL de usuarios. El molde de todos los repositorios:
// preparar la consulta -> ejecutar con los parámetros -> convertir filas en objetos.
//
// SIEMPRE prepared statements: los datos van como parámetros (?), nunca
// concatenados dentro del SQL. Es lo que hace imposible la inyección.

declare(strict_types=1);

class RepositorioUsuarios
{
    public function __construct(private PDO $pdo)
    {
    }

    public function buscarPorEmail(string $email): ?Usuario
    {
        $consulta = $this->pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
        $consulta->execute([$email]);

        $fila = $consulta->fetch();
        return $fila === false ? null : $this->desdeFila($fila);
    }

    public function existeEmail(string $email): bool
    {
        $consulta = $this->pdo->prepare('SELECT 1 FROM usuarios WHERE email = ?');
        $consulta->execute([$email]);
        return $consulta->fetch() !== false;
    }

    public function guardar(Usuario $usuario): void
    {
        // Una sola tabla para toda la jerarquía: se guarda el tipo, y la columna
        // del subtipo que corresponda (la otra queda NULL).
        $consulta = $this->pdo->prepare(
            'INSERT INTO usuarios (email, nombre, password, tipo, especialidad, mutualista)
             VALUES (?, ?, ?, ?, ?, ?)'
        );
        $consulta->execute([
            $usuario->email,
            $usuario->nombre,
            $usuario->password,
            $usuario->tipo(),
            $usuario instanceof Medico ? $usuario->especialidad : null,
            $usuario instanceof Paciente ? $usuario->mutualista : null,
        ]);
    }

    /** La herencia, de vuelta a objetos: la columna `tipo` decide qué clase construir. */
    private function desdeFila(array $fila): Usuario
    {
        return match ($fila['tipo']) {
            'MEDICO' => new Medico(
                $fila['email'], $fila['nombre'], $fila['password'], $fila['especialidad']
            ),
            'PACIENTE' => new Paciente(
                $fila['email'], $fila['nombre'], $fila['password'], $fila['mutualista']
            ),
        };
    }
}
