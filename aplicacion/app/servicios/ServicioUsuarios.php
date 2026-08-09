<?php
// Las reglas de negocio de usuarios: registro y login.
// Los servicios no conocen $_POST ni $_SESSION: reciben valores y devuelven
// objetos o lanzan excepciones. Quién los llama (una página, un script) no importa.

declare(strict_types=1);

class ServicioUsuarios
{
    public function __construct(private RepositorioUsuarios $usuarios)
    {
    }

    /**
     * Registra un médico o un paciente. La contraseña se guarda HASHEADA:
     * password_hash() elige el algoritmo recomendado y genera la sal solo.
     */
    public function registrar(string $tipo, string $email, string $nombre, string $password, string $extra): Usuario
    {
        if ($email === '' || $nombre === '' || $password === '' || $extra === '') {
            throw new ExcepcionClinica('Completá todos los campos.');
        }

        if ($this->usuarios->existeEmail($email)) {
            throw new EmailRepetidoException();
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);

        $usuario = $tipo === 'MEDICO'
            ? new Medico($email, $nombre, $hash, $extra)      // extra = especialidad
            : new Paciente($email, $nombre, $hash, $extra);   // extra = mutualista

        $this->usuarios->guardar($usuario);
        return $usuario;
    }

    /**
     * Verifica las credenciales. El mensaje de error es EL MISMO si el email no
     * existe o si la contraseña está mal: no le decimos a un atacante cuál de
     * las dos cosas acertó.
     */
    public function iniciarSesion(string $email, string $password): Usuario
    {
        $usuario = $this->usuarios->buscarPorEmail($email);

        if ($usuario === null || !password_verify($password, $usuario->password)) {
            throw new CredencialesInvalidasException();
        }

        return $usuario;
    }
}
