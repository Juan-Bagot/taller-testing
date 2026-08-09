#!/usr/bin/env python3
"""
Genera la guía a partir de su plantilla.

Los bloques de código de la guía NO están escritos a mano: se leen de los archivos
reales del proyecto. Así no puede pasar que la guía muestre algo distinto de lo
que corre.

    python3 regenerar-guia.py

Lee las plantillas de esta carpeta y escribe las guías terminadas en ../guia/.

Marcadores que reconoce, dentro de las plantillas:

    <!--CODE:aplicacion/docker-compose.yml-->                     el archivo completo
    <!--CODE:proyecto-tests/helpers/datos.ts:3-8-->                   solo esas líneas

En las plantillas Markdown, el marcador va adentro de un bloque de código con su
lenguaje, y el script lo reemplaza por el contenido del archivo.

Falla si un archivo no existe o si queda un marcador sin resolver, así que no puede
generar una guía a medias.
"""
import html
import pathlib
import re
import sys

PLANTILLAS = pathlib.Path(__file__).resolve().parent
RAIZ = PLANTILLAS.parent          # la carpeta testing/
GUIA = RAIZ / "guia"

GUIAS = [
    ("guia-testing.plantilla.md", "guia-testing.md"),
]


def leer_codigo(spec, faltantes, escapar):
    """spec = 'proyecto/ruta' o 'proyecto/ruta:INICIO-FIN' (1-indexado, inclusivo)."""
    m = re.fullmatch(r"(.+?)(?::(\d+)-(\d+))?", spec)
    ruta, ini, fin = m.group(1), m.group(2), m.group(3)

    archivo = RAIZ / ruta
    if not archivo.exists():
        faltantes.append(ruta)
        return ""

    lineas = archivo.read_text(encoding="utf-8").split("\n")
    if ini:
        lineas = lineas[int(ini) - 1:int(fin)]

    while lineas and not lineas[0].strip():
        lineas.pop(0)
    while lineas and not lineas[-1].strip():
        lineas.pop()

    # tabulaciones -> 4 espacios, para que se vea igual en cualquier visor
    cuerpo = "\n".join(l.replace("\t", "    ") for l in lineas)
    return html.escape(cuerpo, quote=False) if escapar else cuerpo


def generar(plantilla, salida):
    origen = PLANTILLAS / plantilla
    if not origen.exists():
        print(f"  {plantilla}: no existe, se omite")
        return True

    texto = origen.read_text(encoding="utf-8")
    escapar = salida.endswith(".html")
    faltantes = []
    bloques = 0

    def reemplazar(m):
        nonlocal bloques
        bloques += 1
        return leer_codigo(m.group(1), faltantes, escapar)

    texto = re.sub(r"<!--CODE:(.+?)-->", reemplazar, texto)

    if faltantes:
        print(f"  {plantilla}: NO SE ENCONTRARON estos archivos:")
        for f in sorted(set(faltantes)):
            print(f"      {f}")
        return False

    restantes = re.findall(r"<!--CODE:.+?-->", texto)
    if restantes:
        print(f"  {plantilla}: quedaron marcadores sin resolver: {restantes}")
        return False

    (GUIA / salida).write_text(texto, encoding="utf-8")
    print(f"  {salida}: {bloques} bloques de código · {len(texto) / 1024:.0f} KB")
    return True


if __name__ == "__main__":
    print("Generando guías:")
    if not all(generar(p, s) for p, s in GUIAS):
        sys.exit(1)
