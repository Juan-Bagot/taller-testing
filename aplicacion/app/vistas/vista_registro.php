<?php $titulo = 'Crear cuenta'; require __DIR__ . '/fragmentos/cabecera.php'; ?>

<h1>Crear cuenta</h1>

<form method="post" action="registro.php" class="tarjeta formulario">
    <fieldset class="opciones-tipo">
        <legend>Soy</legend>
        <label><input type="radio" name="tipo" value="PACIENTE" checked> Paciente</label>
        <label><input type="radio" name="tipo" value="MEDICO"> Médico/a</label>
    </fieldset>

    <label>Nombre
        <input type="text" name="nombre" required>
    </label>

    <label>Email
        <input type="email" name="email" required>
    </label>

    <label>Contraseña
        <input type="password" name="password" required minlength="6">
    </label>

    <!-- El campo "extra" cambia de significado según el tipo -->
    <label>Mutualista (si sos paciente) / Especialidad (si sos médico)
        <input type="text" name="extra" required>
    </label>

    <button type="submit" class="boton">Crear cuenta</button>
    <p class="al-pie">¿Ya tenés cuenta? <a href="login.php">Iniciá sesión</a></p>
</form>

<?php require __DIR__ . '/fragmentos/pie.php'; ?>
