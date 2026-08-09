# Plantillas y fuentes de la guía

La guía que leen los estudiantes está en `../guia/guia-testing.md`. Esta carpeta tiene
lo que se usa para generarla:

| Archivo | Qué es |
|---|---|
| `guia-testing.plantilla.md` | La plantilla: igual a la guía pero con marcadores en lugar del código |
| `regenerar-guia.py` | Genera la guía (en `../guia/`) a partir de la plantilla |
| `generar-casos-json.py` | Convierte `../casos-de-prueba.md` en el `casos.json` que la app sirve en `/casos.php` |

Los bloques de código de la guía **no están escritos a mano**: se leen de los archivos
reales de `../proyecto-tests/` y `../aplicacion/` con marcadores como:

    ```ts
    <!--CODE:proyecto-tests/pages/PaginaLogin.ts-->
    ```

Si tocás el starter o la plantilla, regenerá:

```bash
python3 regenerar-guia.py
```

El script falla si un archivo no existe o queda un marcador sin resolver.

**Nota de mantenimiento:** el catálogo `../casos-de-prueba.md` es la fuente de verdad.
Si lo editás, corré `python3 generar-casos-json.py` para actualizar las páginas
`/casos.php` de la app. Y si se toca la aplicación, hay que recorrer el catálogo
(referencia textos, datos semilla y precios que salen del código).
