<?php $titulo = 'Iniciar sesión'; require __DIR__ . '/fragmentos/cabecera.php'; ?>

<h1>Iniciar sesión</h1>

<form method="post" action="login.php" class="tarjeta formulario">
    <label>Email
        <input type="email" name="email" required>
    </label>

    <label>Contraseña
        <input type="password" name="password" required>
    </label>

    <button type="submit" class="boton">Entrar</button>
    <p class="al-pie">¿No tenés cuenta? <a href="registro.php">Registrate</a></p>
</form>

<aside class="tarjeta ayuda">
    <h2>Usuarios de prueba</h2>
    <p>Médica: <code>admin@mail.com</code> / <code>admin123</code><br>
       Paciente: <code>ana@mail.com</code> / <code>ana123</code></p>
</aside>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
