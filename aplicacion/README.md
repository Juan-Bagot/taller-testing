# Clínica — la aplicación bajo prueba

La aplicación web sobre la que se automatizan los tests del taller. Es una copia de la
clínica del taller de PHP, con **puertos propios** (para convivir con aquella) y una
**mini-API JSON** agregada (`publico/api/`) para los casos de prueba de API.

**No hace falta saber PHP para el taller**: la app se usa por el navegador y por HTTP.

**Stack:** PHP 8.3 · Apache · MySQL 8 · PDO · Docker Compose. Sin frameworks, sin
Composer, sin JavaScript.

## Levantar todo

```bash
# 1. Levantar los contenedores (la primera vez construye la imagen y crea el esquema)
docker compose up -d --build

# 2. Cargar los datos de ejemplo (idempotente: si ya hay datos, no toca nada)
docker compose exec web php /var/www/app/datos/datos_iniciales.php

# 3. Verificar que todas las capas funcionan (20 pruebas, sin navegador)
docker compose exec web php /var/www/app/pruebas/prueba_conexion.php
```

| Qué | Dónde |
|---|---|
| La aplicación | http://localhost:9080 |
| phpMyAdmin (mirar la base) | http://localhost:9081 — usuario `clinica`, contraseña `clinica` |
| **El catálogo de casos de prueba** | http://localhost:9080/casos.php · http://localhost:9080/casos-api.php |

Para apagar: `docker compose down`. Para **borrar todo y arrancar de cero**:
`docker compose down -v` (y repetir los pasos 1–2).

## Usuarios de prueba

| Usuario | Contraseña | Qué es |
|---|---|---|
| `admin@mail.com` | `admin123` | Médica — administra el catálogo |
| `ana@mail.com` | `ana123` | Paciente, con 3 seguidas y 2 órdenes |
| `luis@mail.com` | `luis123` | Paciente, con 1 seguida y 1 orden |

## Datos precargados: cada uno prueba algo

8 prestaciones (4 estudios y 4 terapias, las tres franjas), 4 seguidas y 3 órdenes.

| Para probar | Con qué |
|---|---|
| Ordenar por precio y por nombre | los precios y los nombres no siguen el mismo orden |
| La herencia en pantalla | estudios (duración) y terapias (derivación, sesiones) |
| "Más reciente primero" | las órdenes de Ana son de hace 10 días y hace 2 |
| Que lo ordenado no se puede eliminar | *Electrocardiograma* está en una orden |
| La cascada de seguidas al eliminar | *Masoterapia* es seguida y no está en ninguna orden |
| Eliminar sin consecuencias | *Audiometría* no tiene seguidas ni órdenes |
| El precio histórico | el electrocardiograma se ordenó a **$1.000** y hoy vale **$1.200**: el historial de Ana no cambió |

## La mini-API

| Endpoint | Auth | Qué hace |
|---|---|---|
| `POST /api/login.php` | — | inicia sesión (setea la cookie) |
| `GET /api/prestaciones.php` | pública | lista; `?orden=nombre\|precio&buscar=texto` |
| `POST /api/prestaciones.php` | médico | crea (201) |
| `GET /api/prestacion.php?id=N` | pública | detalle |
| `PUT /api/prestacion.php?id=N` | médico | modifica (el tipo no se cambia) |
| `DELETE /api/prestacion.php?id=N` | médico | elimina (409 si está en una orden) |

Respuestas `{"ok":true,"datos":...}` / `{"ok":false,"error":{"codigo","mensaje"}}` con
códigos HTTP reales (400/401/403/404/405/409). El contrato completo se ejercita en los
casos TA01–TA13 de `../casos-de-prueba.md`.

## Estructura

```
docker-compose.yml    web (PHP+Apache) + db (MySQL) + phpMyAdmin
Dockerfile            php:8.3-apache + pdo_mysql + php.ini de desarrollo
sql/01-esquema.sql    el DDL — corre solo la primera vez que nace el volumen
publico/              el docroot: una página por pantalla + estilos.css
  api/                  la mini-API JSON (login, prestaciones, prestacion)
app/                  fuera del docroot (inaccesible por URL):
  config.php            constantes de BD, session_start, requires
  cargador.php          la lista de clases (sin autoloader)
  conexion.php          function conexion(): PDO
  sesion.php            usuario_actual, requerir_*, flash, e()
  dominio/              las clases (2 jerarquías, asociativa, composición, enum)
  excepciones/          una por regla de negocio
  repositorios/         TODO el SQL, con prepared statements
  servicios/            las reglas de negocio
  vistas/               HTML con agujeros (fragmentos + una vista por pantalla)
  datos/                datos_iniciales.php (seed idempotente)
  pruebas/              prueba_conexion.php (smoke test de 20 pasos)
```

La regla de dependencia: **página → servicio → repositorio → base**. El SQL solo vive
en `repositorios/`; las reglas solo en `servicios/`; el control de acceso solo en
`sesion.php`.
