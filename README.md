# Taller de Introducción al Testing Funcional

Material completo del taller: la **aplicación bajo prueba** (una clínica web que corre
en tu máquina con Docker), el **catálogo de casos de prueba** a automatizar, la **letra**
del obligatorio, una **guía** paso a paso de Playwright y un **starter** con la
estructura y 4 casos resueltos.

**Stack del taller:** Playwright (TypeScript) · tests funcionales, visuales y de API ·
Docker para la aplicación bajo prueba.

## Estructura

```
aplicacion/        LA APLICACIÓN BAJO PRUEBA (clínica en http://localhost:9080). Ver su README.
casos-de-prueba.md EL CATÁLOGO: los 49 casos con su paso a paso completo (precondiciones,
                   pasos y resultado esperado). Se lee directo acá en GitHub, sin levantar
                   nada. La app también lo sirve en /casos.php y /casos-api.php.
letras/            La letra del obligatorio: puntuación, requisitos, entrega y defensa.
guia/              La guía de Playwright, de la instalación al obligatorio completo.
proyecto-tests/    El starter: estructura + 4 casos resueltos. Se copia a SU repo.
diapositivas/      Las presentaciones del taller (abrir el .html en el navegador).
plantillas/        Fuentes de la guía y del catálogo (mantenimiento). Ver su README.
```

## Por dónde empezar

1. **Levantá la aplicación** (`aplicacion/README.md`: dos comandos) y recorrela a mano
   con los usuarios de prueba.
2. **Leé la letra** (`letras/obligatorio-testing.md`) y el **catálogo de casos**
   (`casos-de-prueba.md` — el paso a paso de cada test, legible sin la app levantada).
3. **Seguí la guía** (`guia/guia-testing.md`): instala Playwright, corre el starter y
   explica cada tipo de test con el código real.
4. **Automatizá el catálogo** (`casos-de-prueba.md`), en su propio repositorio, partiendo
   de `proyecto-tests/`.

## La evaluación, en corto

**18 casos** automatizados y verdes → **nota 6** · **26 casos** → **9** · casos de
**API** → **hasta 12**. El detalle (condiciones de cobertura, requisitos excluyentes,
defensa) está en la letra.

## Usuarios de prueba de la aplicación

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin@mail.com` | `admin123` | Médica |
| `ana@mail.com` | `ana123` | Paciente (con seguidas y órdenes precargadas) |
| `luis@mail.com` | `luis123` | Paciente |
