# Casos de prueba — Clínica

Este es el catálogo oficial del obligatorio: los casos que se automatizan con Playwright
contra la aplicación de `aplicacion/` (levantada en local, **http://localhost:9080**).
El puntaje por cantidad de casos está en `letras/obligatorio-testing.md`.

## La aplicación y sus datos semilla

Usuarios (los crea `datos_iniciales.php`):

| Usuario | Contraseña | Rol | Datos que ya tiene |
|---|---|---|---|
| `admin@mail.com` | `admin123` | Médica ("Dra. Admin") | — |
| `ana@mail.com` | `ana123` | Paciente ("Ana García") | 3 seguidas · 2 órdenes (hace 10 días y hace 2) |
| `luis@mail.com` | `luis123` | Paciente ("Luis Pérez") | 1 seguida · 1 orden (hace 5 días) |

Prestaciones (8; el orden alfabético NO coincide con el orden por precio, a propósito):

| Prestación | Tipo | Precio | Franja | Subtipo | Particularidad |
|---|---|---|---|---|---|
| Audiometría | Estudio | 700 | Mañana | 20 min | sin seguidas ni órdenes |
| Ecografía abdominal | Estudio | 1.800 | Tarde | 30 min | en la orden nueva de Ana |
| Electrocardiograma | Estudio | 1.200 | Noche | 10 min | **en una orden a $1.000 (precio histórico)** → no eliminable |
| Radiografía de tórax | Estudio | 950 | Mañana | 15 min | en la orden de Luis, y seguida |
| Fisioterapia de rodilla | Terapia | 850 | Tarde | deriva, 10 ses. | en la orden vieja de Ana |
| Fonoaudiología | Terapia | 600 | Mañana | no deriva, 8 ses. | seguida de Ana |
| Masoterapia | Terapia | 400 | Tarde | no deriva, 6 ses. | **solo en seguidas** → eliminable con cascada |
| Terapia respiratoria | Terapia | 1.500 | Noche | deriva, 5 ses. | seguida de Luis |

## La regla de oro

> Los casos deben poder correrse **en cualquier orden y repetidas veces**. Los casos que
> crean datos usan **nombres/emails únicos** (sufijo timestamp) y **limpian lo que crean**.
> Nunca asertar cantidades absolutas de filas del catálogo o del historial: asertar sobre
> los datos propios del caso o sobre el orden **relativo** de los datos semilla.
> Dos detalles finos: (1) los **nombres únicos no deben contener** palabras de la semilla
> ("terapia", "grafía", ni nombres de prestaciones): romperían las aserciones de búsqueda
> de TC13/TA04. (2) Algunos casos dejan **residuo aditivo inevitable** (TC28 y TC30 crean
> órdenes; la prestación de TC30 queda no-eliminable): la suite completa corre verde sobre
> una base recién sembrada, y **entre corridas completas se resetea** — sobre todo por los
> casos visuales de página completa, que exigen la semilla intacta.
>
> Los casos marcados ⚠ modifican la semilla: después de correrlos, resetear la base con
>
> ```bash
> docker compose down -v && docker compose up -d --build
> docker compose exec web php /var/www/app/datos/datos_iniciales.php
> ```

## Índice

- **TC01–TC30** — casos web funcionales (registro, login y sesión, control de acceso,
  catálogo, detalle, CRUD de médico, seguidas, solicitud/orden/historial)
- **TV01–TV06** — casos visuales (escritorio y móvil 375px)
- **TA01–TA13** — casos de API (`/api/`; el contrato está en `aplicacion/publico/api/`
  y explicado en la guía §9)

---

### Casos web funcionales (TC01–TC30)

#### Flujo: Registro

**TC01 — Registro exitoso de paciente**
Precondiciones: sin sesión iniciada.
Pasos:
1. Ir a `registro.php`.
2. Dejar seleccionado el tipo "Paciente".
3. Completar Nombre: `Paciente Prueba <timestamp>`, Email: `paciente.<timestamp>@test.com`, Contraseña: `secreta123`, Mutualista/Especialidad: `SEMM`.
4. Enviar con "Crear cuenta".
Resultado esperado: redirige a `login.php`; se muestra el flash ok "Cuenta creada. Ya podés iniciar sesión."; con esas credenciales el login funciona (la barra muestra el nombre del usuario). *(Deja un usuario nuevo: es aditivo y de email único; no afecta otros casos.)*

**TC02 — Registro exitoso de médico**
Precondiciones: sin sesión.
Pasos:
1. Ir a `registro.php`.
2. Seleccionar el tipo "Médico/a".
3. Completar Nombre, Email único con timestamp, Contraseña, y Especialidad: `Cardiología`.
4. Enviar.
Resultado esperado: flash ok "Cuenta creada. Ya podés iniciar sesión." en `login.php`; al iniciar sesión con la cuenta nueva, la barra muestra el enlace "Nueva prestación" (rol MEDICO efectivo).

**TC03 — Registro con email repetido**
Precondiciones: sin sesión; existe `ana@mail.com` (semilla).
Pasos:
1. Ir a `registro.php`.
2. Completar el formulario con Email `ana@mail.com` y el resto de los campos válidos.
3. Enviar.
Resultado esperado: permanece/vuelve a `registro.php`; flash error "Ya existe un usuario con ese email."; no se crea sesión (la barra sigue mostrando "Entrar" / "Registrarse").

#### Flujo: Login y sesión

**TC04 — Login exitoso de paciente**
Precondiciones: sin sesión; semilla cargada.
Pasos:
1. Ir a `login.php`.
2. Completar Email `ana@mail.com`, Contraseña `ana123`.
3. Enviar con "Entrar".
Resultado esperado: redirige a `catalogo.php`; flash ok "Hola, Ana García."; la barra muestra "Ana García" y "Salir"; están visibles los enlaces "Seguidas", "Solicitud" e "Historial"; en el catálogo cada fila ofrece "Seguir" y "Solicitar", y NO ofrece "Editar" ni "Eliminar".

**TC05 — Login exitoso de médico**
Precondiciones: sin sesión.
Pasos:
1. Iniciar sesión con `admin@mail.com` / `admin123`.
Resultado esperado: redirige a `catalogo.php` con flash ok "Hola, Dra. Admin."; la barra muestra "Nueva prestación" y NO muestra "Seguidas"/"Solicitud"/"Historial"; en el catálogo cada fila ofrece "Editar" y "Eliminar", y NO ofrece "Seguir" ni "Solicitar".

**TC06 — Login con credenciales inválidas (mismo mensaje en ambas variantes)**
Precondiciones: sin sesión.
Pasos:
1. Ir a `login.php`, ingresar `ana@mail.com` / `incorrecta` y enviar.
2. Verificar el mensaje.
3. Ingresar `noexiste@mail.com` / `loquesea` y enviar.
Resultado esperado: en ambos intentos permanece en `login.php` con flash error **idéntico**: "Email o contraseña incorrectos." (no se revela si el email existe); no hay sesión iniciada.

**TC07 — Salir cierra la sesión y descarta la solicitud a medio armar**
Precondiciones: semilla cargada.
Pasos:
1. Iniciar sesión como `luis@mail.com` / `luis123`.
2. En el catálogo, "Solicitar" sobre Audiometría (el contador de la barra pasa a 1).
3. Click en "Salir".
4. Intentar ir directo a `historial.php`.
5. Volver a iniciar sesión como Luis e ir a "Solicitud".
Resultado esperado: (3) redirige a `login.php` y la barra vuelve a mostrar "Entrar"; (4) redirige a `login.php` con flash "Tenés que iniciar sesión para entrar ahí."; (5) la solicitud está vacía ("La solicitud está vacía.") y la barra no muestra contador — el carrito no sobrevive al cierre de sesión.

#### Flujo: Control de acceso

**TC08 — Anónimo no entra a ninguna página protegida**
Precondiciones: contexto sin sesión (navegador limpio).
Pasos:
1. Navegar directo a `seguidas.php`. 2. Ídem `solicitud.php`. 3. Ídem `historial.php`. 4. Ídem `prestacion_alta.php`.
Resultado esperado: las cuatro veces redirige a `login.php` con flash error "Tenés que iniciar sesión para entrar ahí." (el control es del servidor: no depende de que los botones estén ocultos).

**TC09 — Paciente no accede a funciones de médico**
Precondiciones: sesión como `ana@mail.com`.
Pasos:
1. Navegar directo a `prestacion_alta.php`.
2. Navegar directo a `prestacion_editar.php?id=1`.
Resultado esperado: ambas veces redirige a `catalogo.php` con flash error "Esa función es solo para médicos."; la sesión de Ana sigue activa.

**TC10 — Médico no accede a funciones de paciente**
Precondiciones: sesión como `admin@mail.com`.
Pasos:
1. Navegar directo a `seguidas.php`. 2. Ídem `solicitud.php`. 3. Ídem `historial.php`.
Resultado esperado: las tres veces redirige a `catalogo.php` con flash error "Esa función es solo para pacientes."

#### Flujo: Catálogo, búsqueda y orden

**TC11 — Catálogo ordenado por nombre (orden por defecto)**
Precondiciones: semilla cargada; sin sesión.
Pasos:
1. Ir a `catalogo.php` sin parámetros.
Resultado esperado: la tabla contiene las 8 prestaciones semilla en orden alfabético **relativo**: Audiometría, Ecografía abdominal, Electrocardiograma, Fisioterapia de rodilla, Fonoaudiología, Masoterapia, Radiografía de tórax, Terapia respiratoria; cada fila muestra Tipo (Estudio/Terapia), Franja y Precio formateado (`$ 700,00`); como anónimo, la única acción por fila es "Ver".

**TC12 — Catálogo ordenado por precio**
Precondiciones: semilla; sin sesión.
Pasos:
1. Ir a `catalogo.php`.
2. En el selector de orden elegir "Por precio" y click en "Aplicar".
Resultado esperado: la URL contiene `orden=precio`; el orden relativo de las semilla es ascendente por precio: Masoterapia ($400) primero … Ecografía abdominal ($1.800) al final — nótese que difiere del alfabético (Audiometría ya no es la primera); el selector queda en "Por precio".

**TC13 — Búsqueda case-insensitive combinada con orden**
Precondiciones: semilla; sin sesión.
Pasos:
1. En el catálogo, escribir `TERAPIA` (en MAYÚSCULAS) en el campo de búsqueda, elegir "Por precio" y "Aplicar".
Resultado esperado: aparecen exactamente 3 prestaciones semilla pese a que sus nombres están en minúsculas/mixto — Masoterapia, Fisioterapia de rodilla y Terapia respiratoria — en ese orden (ascendente por precio); la URL contiene `buscar=TERAPIA&orden=precio`; el input conserva el texto y el select conserva "Por precio" (se puede refrescar y el resultado persiste).

**TC14 — Búsqueda sin resultados y "Limpiar"**
Precondiciones: sin sesión.
Pasos:
1. Buscar el texto `zzz-no-existe`.
2. Click en el enlace "Limpiar".
Resultado esperado: (1) no se muestra la tabla; se muestra el mensaje "No hay prestaciones que coincidan con la búsqueda." y aparece el enlace "Limpiar"; (2) el catálogo vuelve a mostrar todas las prestaciones y el campo de búsqueda queda vacío.

#### Flujo: Detalle de prestación

**TC15 — Detalle de un Estudio**
Precondiciones: semilla; sin sesión.
Pasos:
1. En el catálogo, click en el nombre "Audiometría".
Resultado esperado: se muestra la etiqueta "Estudio", el título "Audiometría", Precio `$ 700,00`, Franja horaria "Mañana" y Duración "20 minutos"; NO se muestran "Requiere derivación" ni "Cantidad de sesiones"; existe el enlace "← Volver al catálogo".

**TC16 — Detalle de una Terapia**
Precondiciones: semilla; sin sesión.
Pasos:
1. Ir al detalle de "Terapia respiratoria".
Resultado esperado: etiqueta "Terapia", Precio `$ 1.500,00`, Franja "Noche", "Requiere derivación: Sí", "Cantidad de sesiones: 5"; NO se muestra "Duración".

**TC17 — Detalle con id inexistente**
Precondiciones: ninguna.
Pasos:
1. Navegar directo a `prestacion.php?id=99999`.
Resultado esperado: redirige a `catalogo.php` con flash error "No existe esa prestación."

#### Flujo: CRUD de prestaciones (médico)

**TC18 — Crear un estudio (auto-contenido)**
Precondiciones: sesión como médico.
Pasos:
1. Click en "Nueva prestación".
2. Tipo "Estudio"; Nombre `Estudio Prueba <timestamp>`; Precio `990`; Franja "Tarde"; Duración `25`.
3. Enviar con "Crear prestación".
4. Verificar en el catálogo y en el detalle.
5. **Limpieza**: eliminarla desde el catálogo (o vía `DELETE /api/prestacion.php`).
Resultado esperado: (3) redirige a `catalogo.php` con flash ok "Prestación creada."; (4) la fila aparece con tipo "Estudio", franja "Tarde" y `$ 990,00`, y el detalle muestra "Duración: 25 minutos"; (5) el caso termina sin dejar rastro.

**TC19 — Crear una terapia con derivación (auto-contenido)**
Precondiciones: sesión como médico.
Pasos:
1. "Nueva prestación"; tipo "Terapia"; Nombre único con timestamp; Precio `1250`; Franja "Noche"; marcar "Requiere derivación"; Cantidad de sesiones `12`.
2. Enviar; abrir el detalle.
3. **Limpieza**: eliminarla.
Resultado esperado: flash ok "Prestación creada."; el detalle muestra "Requiere derivación: Sí" y "Cantidad de sesiones: 12"; sin rastro al terminar.

**TC20 — Crear con nombre repetido (auto-contenido)**
Precondiciones: sesión como médico.
Pasos:
1. Crear una prestación con nombre único `P-<timestamp>` (queda creada).
2. Intentar crear OTRA con exactamente el mismo nombre.
3. **Limpieza**: eliminar la del paso 1.
Resultado esperado: (2) vuelve a `prestacion_alta.php` con flash error "Ya existe una prestación con ese nombre." y en el catálogo hay UNA sola fila con ese nombre. *(Variante mínima sin crear nada: usar el nombre semilla "Audiometría"; también es válida y es read-only.)*

**TC21 — Editar una prestación (auto-contenido; el tipo no se cambia)**
Precondiciones: sesión como médico.
Pasos:
1. Crear un estudio `Editar-<timestamp>` con precio `500`.
2. En el catálogo, click "Editar" en su fila.
3. Verificar que el tipo se muestra como dato fijo ("Tipo: Estudio", sin radios para cambiarlo).
4. Cambiar el nombre a `Editada-<timestamp>` y el precio a `900`; "Guardar cambios".
5. **Limpieza**: eliminarla.
Resultado esperado: (4) redirige a `catalogo.php` con flash ok "Prestación actualizada."; el catálogo muestra el nombre nuevo con `$ 900,00` y ya no muestra el nombre viejo.

**TC22 — Eliminar una prestación sin uso (auto-contenido)**
Precondiciones: sesión como médico.
Pasos:
1. Crear una prestación `Borrar-<timestamp>` (UI o API).
2. En el catálogo, click "Eliminar" en su fila.
Resultado esperado: flash ok "Prestación eliminada."; la fila ya no aparece; navegar a su detalle por URL redirige al catálogo con "No existe esa prestación." *(La variante con datos semilla es eliminar "Audiometría", pero eso muta la semilla: preferir SIEMPRE esta versión auto-contenida.)*

**TC23 — La eliminación se bloquea si la prestación está en una orden (read-only)**
Precondiciones: sesión como médico; semilla cargada (Electrocardiograma figura en la orden vieja de Ana).
Pasos:
1. En el catálogo, click "Eliminar" en la fila de "Electrocardiograma".
Resultado esperado: flash error "No se puede eliminar: la prestación aparece en una orden médica."; Electrocardiograma sigue en el catálogo (el historial no se reescribe). El caso no modifica nada: se puede repetir infinitas veces.

**TC24 ⚠ — Eliminar con cascada de seguidas (Masoterapia)**
Precondiciones: semilla RECIÉN cargada (Masoterapia está solo en las seguidas de Ana, en ninguna orden).
Pasos:
1. Sesión como médico; verificar que Masoterapia está en el catálogo.
2. (Opcional, en otro contexto) sesión como Ana: verificar que Masoterapia figura en "Mis seguidas".
3. Como médico, "Eliminar" sobre Masoterapia.
4. Sesión como Ana: ir a "Mis seguidas".
Resultado esperado: (3) flash ok "Prestación eliminada."; (4) Masoterapia ya NO aparece en las seguidas de Ana (la FK con CASCADE la limpió) y Ana conserva sus otras 2 seguidas.
**⚠ Este caso destruye datos semilla.** Documentar en el test y en el README: correrlo al final de la suite o resetear la base después (`docker compose down -v && up -d && seed`). Alternativa auto-contenida (recomendada para la suite automatizada): el médico crea una prestación nueva, Ana la sigue, el médico la elimina y se verifica la cascada — cero impacto en la semilla.

#### Flujo: Seguidas (paciente)

**TC25 — Seguir desde el detalle y quitar (auto-contenido)**
Precondiciones: sesión como `luis@mail.com` (solo sigue "Terapia respiratoria"); Audiometría no está entre sus seguidas.
Pasos:
1. Ir al detalle de "Audiometría" y click en "Seguir".
2. Verificar que vuelve al **detalle** de Audiometría (el hidden `volver`) con flash ok "Agregada a tus seguidas."
3. Ir a "Mis seguidas": la fila de Audiometría aparece con tipo "Estudio", precio `$ 700,00` y "Seguida desde" = fecha de hoy.
4. **Limpieza**: click "Quitar" en esa fila.
Resultado esperado: tras (4), Audiometría desaparece de la lista y "Terapia respiratoria" sigue ahí — la lista quedó como al principio.
*Dos trampas conocidas al automatizarlo: la "fecha de hoy" se compara en hora **local** (`toISOString()` de JavaScript es UTC: de noche ya es "mañana"); y conviene **limpieza defensiva** — quitar la seguida también al EMPEZAR el test, porque si una corrida anterior falló a mitad, el residuo hace fallar el paso 1 con "Ya estás siguiendo esa prestación".*

**TC26 — No se puede seguir dos veces la misma prestación (read-only)**
Precondiciones: sesión como `ana@mail.com` (ya sigue "Fonoaudiología" por semilla).
Pasos:
1. En el catálogo, click "Seguir" en la fila de "Fonoaudiología".
Resultado esperado: flash error "Ya estás siguiendo esa prestación."; en "Mis seguidas" Fonoaudiología aparece UNA sola vez. Nada cambió: repetible.

#### Flujo: Solicitud, orden e historial (paciente)

**TC27 — Armar y editar la solicitud (auto-contenido: el carrito vive en la sesión)**
Precondiciones: sesión como `luis@mail.com` en un contexto de navegador **nuevo** (carrito vacío garantizado).
Pasos:
1. En el catálogo, "Solicitar" sobre Audiometría → el contador de la barra muestra 1.
2. Ir al detalle de "Fonoaudiología", poner Cantidad `3` y "Agregar a la solicitud" → contador 4.
3. Ir a "Solicitud": verificar filas y montos.
4. "Quitar" la fila de Fonoaudiología.
5. "Quitar" la fila de Audiometría.
Resultado esperado: (3) Audiometría `$ 700,00 × 1 = $ 700,00`; Fonoaudiología `$ 600,00 × 3 = $ 1.800,00`; Total `$ 2.500,00`; (4) el total recalcula a `$ 700,00`; (5) se muestra "La solicitud está vacía." y el contador desaparece. No tocó la base en ningún momento.

**TC28 — Confirmar la orden médica**
Precondiciones: sesión como `luis@mail.com`, contexto nuevo.
Pasos:
1. Agregar a la solicitud: Ecografía abdominal ×1 y Fisioterapia de rodilla ×2.
2. Ir a "Solicitud" y click "Confirmar la orden médica".
3. Observar el flash y el historial.
Resultado esperado: redirige a `historial.php` con flash ok "Orden #N confirmada." (N numérico); la **primera** orden del historial (más reciente) contiene Ecografía abdominal ×1 a `$ 1.800,00` y Fisioterapia de rodilla ×2 a `$ 850,00` (subtotal `$ 1.700,00`), total `$ 3.500,00`; el contador del carrito quedó en cero. *(Aditivo: crea una orden nueva — por eso NUNCA se asertan cantidades absolutas de órdenes: siempre "la primera orden". Y las prestaciones elegidas YA estaban en órdenes semilla, a propósito: ordenar una prestación la vuelve no-eliminable para siempre, así que este caso no debe usar Audiometría ni Masoterapia, que la semilla mantiene eliminables para TC22/TC24.)*

**TC29 — Historial descendente y precio histórico congelado (read-only, caso estrella)**
Precondiciones: semilla cargada; sesión como `ana@mail.com`.
Pasos:
1. Ir a "Historial".
2. Verificar el orden de las órdenes semilla: la de hace 2 días (Ecografía abdominal) aparece ANTES que la de hace 10 días (Electrocardiograma + Fisioterapia).
3. En la orden vieja, leer el precio de "Electrocardiograma".
4. En otra pestaña/navegación, abrir el detalle de "Electrocardiograma" en el catálogo.
Resultado esperado: (2) historial más reciente primero; (3) la línea muestra "Precio de ese momento" `$ 1.000,00` y el total de esa orden es `$ 1.850,00`; (4) el catálogo/detalle muestra el precio ACTUAL `$ 1.200,00` — el historial no cambió aunque el precio sí.

**TC30 — Precio histórico end-to-end con dos roles (auto-contenido, avanzado)**
Precondiciones: dos contextos de navegador: médico (`admin@mail.com`) y paciente (`luis@mail.com`).
Pasos:
1. Médico: crear prestación `Historico-<timestamp>`, precio `500`.
2. Paciente: solicitarla ×1 y confirmar la orden (anotar el número del flash).
3. Médico: editarla y cambiar el precio a `800`.
4. Paciente: ir al Historial y localizar la orden del paso 2; ir también al detalle en el catálogo.
Resultado esperado: la línea de la orden muestra `$ 500,00` (precio congelado al confirmar); el catálogo muestra `$ 800,00`. *(Residuo: la prestación queda en una orden y por regla de negocio ya no es eliminable — es un residuo aditivo con nombre único, aceptable y documentado. Bonus didáctico: intentar eliminarla y recibir "No se puede eliminar…" convierte la limpieza imposible en una aserción más.)*

---

### Casos visuales (TV01–TV06)

Convención general: baselines generadas **en la máquina del propio equipo** (`--update-snapshots` la primera vez) y comparadas siempre en ese mismo SO; `maxDiffPixelRatio: 0.02` en la config. Todas las páginas elegidas son estables (sin fechas ni datos variables) salvo donde se indica precondición de semilla.

**Orden dentro de la suite:** los visuales de página completa del catálogo exigen la
**semilla intacta**, así que corren **antes** que los casos que crean datos (nombrá el
archivo para que ordene primero, por ejemplo `00-visual.spec.ts`) — y entre corridas
completas de la suite (que dejan el residuo aditivo de TC28/TC30) se **resetea la base**.

**TV01 — Login en escritorio (1280×720)**
Precondiciones: sin sesión.
Pasos: 1. Ir a `login.php`. 2. `expect(page).toHaveScreenshot('login-escritorio.png')`.
Resultado esperado: la captura coincide con la baseline: formulario en tarjeta, tarjeta "Usuarios de prueba" al costado, barra con "Entrar"/"Registrarse".

**TV02 — Registro en escritorio (1280×720)**
Precondiciones: sin sesión.
Pasos: 1. Ir a `registro.php`. 2. Captura de página completa.
Resultado esperado: coincide con la baseline (radios Paciente/Médico, 4 campos con label, botón "Crear cuenta").

**TV03 — Catálogo anónimo en escritorio (1280×720)**
Precondiciones: **semilla intacta** (8 prestaciones exactas; si la suite creó datos, este caso debe correr antes o tras un reset — documentarlo en el spec).
Pasos: 1. Ir a `catalogo.php`. 2. Captura de página completa.
Resultado esperado: coincide con la baseline: tabla de 8 filas ordenada por nombre, formulario de filtros arriba.

**TV04 — Catálogo en móvil (375×667): la tabla se vuelve bloques**
Precondiciones: semilla intacta; proyecto/viewport 375×667.
Pasos: 1. Ir a `catalogo.php` con viewport móvil. 2. Captura de página completa.
Resultado esperado: coincide con la baseline móvil: las filas se muestran como bloques apilados y cada celda muestra su rótulo (`data-rotulo`: "Nombre", "Tipo", "Franja", "Precio") — el `@media` actúa gracias al meta viewport.

**TV05 — Detalle de terapia en móvil (375×667)**
Precondiciones: semilla intacta.
Pasos: 1. Ir al detalle de "Terapia respiratoria" con viewport 375. 2. Captura de página completa.
Resultado esperado: coincide con la baseline: tarjeta de detalle apilada con etiqueta "Terapia", precio grande y la lista de definiciones legible a una columna.

**TV06 — Screenshot de ELEMENTO: el mensaje flash de error**
Precondiciones: sin sesión.
Pasos: 1. En `login.php`, enviar credenciales inválidas. 2. Capturar SOLO el elemento del mensaje (`locator('.mensaje-error')`) con `toHaveScreenshot('flash-error.png')`.
Resultado esperado: coincide con la baseline del elemento (fondo/estilo de error con el texto "Email o contraseña incorrectos."). Demuestra la técnica de captura por elemento, mucho menos frágil que la página completa.

---

### Casos de API (TA01–TA13)

Todos con el `request` context de Playwright contra `http://localhost:9080`. "Sesión de médico/paciente" = haber hecho antes `POST /api/login.php` en ese mismo contexto (la cookie queda guardada).

**TA01 — Login por API exitoso**
Precondiciones: semilla cargada; contexto de request nuevo.
Pasos: 1. `POST /api/login.php` con cuerpo `{"email":"admin@mail.com","password":"admin123"}`.
Resultado esperado: estado **200**; cuerpo `{"ok":true,"datos":{"email":"admin@mail.com","nombre":"Dra. Admin","tipo":"MEDICO"}}`; la respuesta setea la cookie de sesión (las llamadas siguientes del contexto quedan autenticadas). `Content-Type` incluye `application/json`.

**TA02 — Login por API: negativos**
Precondiciones: contexto nuevo.
Pasos: 1. `POST /api/login.php` con `{"email":"admin@mail.com","password":"mala"}`. 2. `POST` con `{"email":"admin@mail.com"}` (falta password). 3. `POST` con cuerpo `esto-no-es-json`.
Resultado esperado: (1) **401** con `error.codigo = "CREDENCIALES_INVALIDAS"` y mensaje "Email o contraseña incorrectos."; (2) **400** `VALIDACION`; (3) **400** `JSON_INVALIDO`. En todos, `ok: false`.

**TA03 — Listar prestaciones (público) y shape por subtipo**
Precondiciones: semilla; SIN login.
Pasos: 1. `GET /api/prestaciones.php`.
Resultado esperado: **200**; `datos` es un array que contiene las 8 semilla en orden alfabético relativo; el elemento "Electrocardiograma" tiene `tipo:"ESTUDIO"`, `precio:1200`, `franja:"NOCHE"`, `duracion_minutos:10` y NO tiene campos de terapia; "Terapia respiratoria" tiene `tipo:"TERAPIA"`, `requiere_derivacion:true`, `cantidad_sesiones:5` y NO tiene `duracion_minutos`.

**TA04 — Listar con búsqueda y orden**
Precondiciones: semilla; sin login.
Pasos: 1. `GET /api/prestaciones.php?buscar=TERAPIA&orden=precio`. 2. `GET /api/prestaciones.php?orden=cualquiera`.
Resultado esperado: (1) **200** con exactamente 3 resultados semilla en orden Masoterapia, Fisioterapia de rodilla, Terapia respiratoria (case-insensitive + orden por precio); (2) **400** `VALIDACION` (orden inválido).

**TA05 — Detalle por id**
Precondiciones: semilla; sin login.
Pasos: 1. Obtener el id de "Audiometría" desde el listado. 2. `GET /api/prestacion.php?id={id}`.
Resultado esperado: **200**; `datos` = `{"id":…, "nombre":"Audiometría","precio":700,"franja":"MANANA","tipo":"ESTUDIO","duracion_minutos":20}`.

**TA06 — Detalle: id inexistente y ausente**
Pasos: 1. `GET /api/prestacion.php?id=99999`. 2. `GET /api/prestacion.php` (sin id). 3. `GET /api/prestacion.php?id=abc`.
Resultado esperado: (1) **404** `NO_EXISTE` con mensaje "No existe esa prestación."; (2) y (3) **400** `VALIDACION`.

**TA07 — Crear sin sesión → 401**
Precondiciones: contexto de request SIN login.
Pasos: 1. `POST /api/prestaciones.php` con un cuerpo válido de estudio.
Resultado esperado: **401** `NO_AUTENTICADO`; el listado NO contiene la prestación (no se creó nada).

**TA08 — Crear con sesión de paciente → 403**
Precondiciones: login por API como `ana@mail.com`/`ana123`.
Pasos: 1. `POST /api/prestaciones.php` con cuerpo válido.
Resultado esperado: **403** `SOLO_MEDICO`; nada creado.

**TA09 — Crear como médico → 201 (auto-contenido)**
Precondiciones: login por API como médico.
Pasos:
1. `POST /api/prestaciones.php` con `{"tipo":"TERAPIA","nombre":"Api-<timestamp>","precio":777,"franja":"TARDE","requiere_derivacion":true,"cantidad_sesiones":4}`.
2. `GET /api/prestacion.php?id={id devuelto}`.
3. **Limpieza**: `DELETE /api/prestacion.php?id={id}`.
Resultado esperado: (1) **201**, `datos.id` numérico y el resto de los campos eco del enviado; (2) **200** con los mismos datos persistidos; (3) **200** `{"eliminada":true}` — sin rastro al terminar.

**TA10 — Crear inválida → 400 (variantes de validación)**
Precondiciones: login como médico.
Pasos: 1. `POST` con `precio: 0`. 2. `POST` con `nombre: ""`. 3. `POST` con `franja:"MADRUGADA"`. 4. `POST` con `tipo:"CIRUGIA"`.
Resultado esperado: **400** `VALIDACION` en todos, con los mensajes del servicio en (1) "El precio tiene que ser mayor que cero." y (2) "El nombre no puede estar vacío."; nada creado (verificable por listado).

**TA11 — Crear con nombre repetido → 409 (read-only)**
Precondiciones: login como médico; semilla.
Pasos: 1. `POST /api/prestaciones.php` con `nombre:"Audiometría"` y resto válido.
Resultado esperado: **409** `NOMBRE_REPETIDO`, mensaje "Ya existe una prestación con ese nombre."; el listado sigue teniendo UNA sola Audiometría.

**TA12 — Modificar con PUT (auto-contenido + negativos)**
Precondiciones: login como médico.
Pasos:
1. Crear por API `Put-<timestamp>` precio `500`.
2. `PUT /api/prestacion.php?id={id}` cambiando nombre a `Put-editada-<timestamp>` y precio a `900`.
3. `GET` para verificar.
4. `PUT /api/prestacion.php?id=99999` con cuerpo válido.
5. `PUT` sobre {id} con `nombre:"Audiometría"`.
6. **Limpieza**: `DELETE` {id}.
Resultado esperado: (2) **200** con los datos nuevos; (3) confirma persistencia; (4) **404** `NO_EXISTE`; (5) **409** `NOMBRE_REPETIDO` (choca con OTRA prestación).

**TA13 — Eliminar: feliz, bloqueada y método no permitido**
Precondiciones: login como médico; semilla (Electrocardiograma en orden).
Pasos:
1. Crear por API `Del-<timestamp>` y `DELETE /api/prestacion.php?id={id}`.
2. `GET` sobre ese id.
3. Obtener el id de "Electrocardiograma" y `DELETE /api/prestacion.php?id={ese id}`.
4. `PATCH /api/prestacion.php?id=1`.
Resultado esperado: (1) **200** `{"eliminada":true}`; (2) **404**; (3) **409** `EN_ORDEN` — "No se puede eliminar: la prestación aparece en una orden médica." y Electrocardiograma sigue en el listado; (4) **405** `METODO_NO_PERMITIDO` con header `Allow: GET, PUT, DELETE`.

