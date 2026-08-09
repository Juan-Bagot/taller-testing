#!/usr/bin/env python3
"""
Convierte casos-de-prueba.md en el casos.json que la aplicación sirve en
casos.php / casos-api.php (el catálogo embebido en el sitio, estilo
automationexercise.com/test_cases).

    python3 generar-casos-json.py

La fuente de verdad es SIEMPRE el markdown: si editás casos, corré esto.
"""
import json
import pathlib
import re

PLANTILLAS = pathlib.Path(__file__).resolve().parent
RAIZ = PLANTILLAS.parent
ORIGEN = RAIZ / "casos-de-prueba.md"
DESTINO = RAIZ / "aplicacion" / "app" / "datos" / "casos.json"

texto = ORIGEN.read_text(encoding="utf-8")

# Los tres grandes grupos del catálogo.
grupos_md = re.split(r"\n### ", texto)[1:]  # descarta el encabezado del documento

resultado = []
for grupo_md in grupos_md:
    lineas = grupo_md.split("\n")
    titulo_grupo = lineas[0].strip()
    cuerpo_grupo = "\n".join(lineas[1:])

    secciones = []
    # Dentro del grupo, las secciones "#### Flujo: X" (los grupos TV/TA no tienen).
    partes = re.split(r"\n#### ", cuerpo_grupo)
    for i, parte in enumerate(partes):
        if i == 0 and not partes[0].strip().startswith("Flujo"):
            nombre_seccion = ""
            contenido = parte
        else:
            nombre_seccion, _, contenido = parte.partition("\n")

        casos = []
        # Cada caso: **TCnn [⚠ ]— título** hasta el próximo caso o el final.
        for m in re.finditer(
            r"\*\*(T[CVA]\d+)( ⚠)? — (.+?)\*\*\n(.*?)(?=\n\*\*T[CVA]\d+|\Z)",
            contenido, re.S,
        ):
            casos.append({
                "id": m.group(1),
                "alerta": bool(m.group(2)),
                "titulo": m.group(3).strip(),
                "cuerpo": m.group(4).strip(),
            })
        if casos:
            secciones.append({"seccion": nombre_seccion.strip(), "casos": casos})

    if secciones:
        resultado.append({"grupo": titulo_grupo, "secciones": secciones})

DESTINO.parent.mkdir(parents=True, exist_ok=True)
DESTINO.write_text(json.dumps(resultado, ensure_ascii=False, indent=1), encoding="utf-8")

total = sum(len(s["casos"]) for g in resultado for s in g["secciones"])
print(f"casos.json: {len(resultado)} grupos · {total} casos · {DESTINO.stat().st_size // 1024} KB")
