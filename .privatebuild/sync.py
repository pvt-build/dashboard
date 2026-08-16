#!/usr/bin/env python3
"""
Regenera el bloque <script id="pvt-data"> de index.html desde las fuentes reales.

Fuentes y su estado:

  infra     →  ~/.claude/skills + repos del proyecto     AUTOMÁTICO
  comercial →  Notion · CRM + Llamadas Comerciales       requiere NOTION_TOKEN
  marketing →  Notion · Repositorio-contenido            requiere NOTION_TOKEN

Sin token, los dos bloques de Notion quedan intactos: el script nunca borra
data que no puede recalcular, solo marca la fuente como vieja en el header.

Uso:
    python3 Webs/panel-troncal/.privatebuild/sync.py            # en seco
    python3 Webs/panel-troncal/.privatebuild/sync.py --aplicar
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import date, datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[3]
PANEL = RAIZ / "Webs" / "panel-troncal" / "index.html"

BLOQUE = re.compile(
    r'(<script id="pvt-data" type="application/json">)(.*?)(</script>)', re.S
)

# IDs de las bases de Notion (data sources)
CRM = "909764aa-a4f3-4297-9007-4b5f00f0fc21"
LLAMADAS = "e67877bd-8e0e-4279-b609-fee86a292ac8"
CONTENIDO = "2501b21d-b3ba-806d-bae1-000bf51efaff"


# ─────────────────────────────────────────── utilidades

def lag(iso):
    """Días entre una fecha ISO y hoy. None si no hay fecha."""
    if not iso:
        return None
    return (date.today() - date.fromisoformat(iso)).days


def leer_bloque(ruta, script_id):
    """Extrae y parsea un bloque <script id=...> de un HTML."""
    html = ruta.read_text(encoding="utf-8")
    m = re.search(
        r'<script id="%s"[^>]*>(.*?)</script>' % re.escape(script_id), html, re.S
    )
    if not m:
        raise SystemExit("No encontré el bloque '%s' en %s" % (script_id, ruta))
    return json.loads(m.group(1))


MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
         "agosto", "septiembre", "octubre", "noviembre", "diciembre"]


ABREV = ["ene", "feb", "mar", "abr", "may", "jun",
         "jul", "ago", "sep", "oct", "nov", "dic"]


def nombre_mes(iso):
    """'2026-08' → 'agosto'."""
    return MESES[int(iso.split("-")[1]) - 1]


def iso_desde_texto(txt):
    """'30 jul 2026' → '2026-07-30'. Es el formato que usa el bloque de Athlete OS."""
    dia, mes, anio = txt.split()
    return "%s-%02d-%02d" % (anio, ABREV.index(mes[:3].lower()) + 1, int(dia))


def coma(v):
    """Decimales con coma, como se escribe en Chile."""
    return str(v).replace(".", ",")


def millones(n):
    """3200000 → '3,20' (en millones, coma decimal)."""
    return ("%.2f" % (n / 1_000_000)).replace(".", ",")


def miles(n):
    """-143065 → '−143' (en miles, con signo menos tipográfico)."""
    v = round(n / 1000)
    return ("−" if v < 0 else "") + str(abs(v))


# ────────────────────────────────────────── build

SKILLS = Path.home() / ".claude" / "skills"


def bloque_build(previo):
    """
    Cuenta skills, líneas y referencias desde el filesystem. El estado de cada
    sistema es juicio (¿corre solo o no?): se conserva el que ya está escrito.
    """
    if not SKILLS.is_dir():
        return previo, None, {}

    dirs = sorted(d for d in SKILLS.iterdir() if d.is_dir())
    lineas = 0
    refs = 0
    por_mes = {}
    for d in dirs:
        md = d / "SKILL.md"
        if md.exists():
            lineas += len(md.read_text(encoding="utf-8", errors="ignore").splitlines())
        r = d / "references"
        if r.is_dir():
            refs += len([f for f in r.iterdir() if f.is_file()])
        # fecha de nacimiento del directorio
        nace = datetime.fromtimestamp(d.stat().st_birthtime).strftime("%Y-%m")
        por_mes.setdefault(nace, []).append(d.name.replace("pvt-", "").replace("-agent", ""))

    b = json.loads(json.dumps(previo))
    b["stats"][0]["v"] = str(len(dirs))
    b["stats"][1]["v"] = "{:,.0f}".format(lineas).replace(",", ".")
    b["stats"][1]["f"] = "+ %d archivos de referencia" % refs

    vivos = [s["n"].split(" · ")[0] for s in b["sistemas"] if s["e"] == "live"]
    b["stats"][2]["v"] = str(len(vivos))
    b["stats"][2]["u"] = "/ %d" % len(b["sistemas"])
    b["stats"][2]["f"] = ", ".join(vivos) if vivos else "Ninguno"

    # el inventario escrito a mano se sincroniza con lo que existe de verdad:
    # se conserva la descripción de cada skill viva y se quitan las que ya no están
    vivas = {d.name.replace("pvt-", "").replace("-agent", "") for d in dirs}
    inv = {x["n"]: x for x in b.get("skills", [])}
    b["skills"] = (
        [inv[n] for n in sorted(vivas) if n in inv]
        + [{"n": n, "c": "Sin clasificar", "d": "Skill nueva — falta describirla",
            "nivel": "skill"} for n in sorted(vivas - set(inv))]
    )

    b["skills_mes"] = [
        {"m": ABREV[int(k.split("-")[1]) - 1], "n": len(v), "l": ", ".join(sorted(v))}
        for k, v in sorted(por_mes.items())
    ]
    return b, len(dirs), por_mes


def propagar_skills(data, n_skills, por_mes):
    """
    El conteo de skills se cita en tres lugares fuera del bloque infra. Son
    textos de juicio, así que solo se les cambia el número — no la frase.
    """
    patron = re.compile(r"\b\d+ skills\b")
    # el radar se dibuja desde radar.areas: hay una sola lista que tocar
    for a in data["radar"].get("areas", []):
        if a["n"] == "Infra":
            for campo in ("r", "nota"):
                if campo in a:
                    a[campo] = patron.sub("%d skills" % n_skills, a[campo])

    # el bloque comercial cita los tramos por índice; los tramos 04 y 05 los
    # recalcula bloque_negocio, así que acá solo se toca el texto de infra.


# ─────────────────────────────────────────── notion

def notion(token, sql, fuentes):
    req = urllib.request.Request(
        "https://api.notion.com/v1/data_sources/query_sql",
        data=json.dumps({"data_source_urls": fuentes, "query": sql}).encode(),
        headers={
            "Authorization": "Bearer %s" % token,
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def bloque_negocio(token, previo):
    """
    Recalcula los números duros del CRM. La lectura de cada tramo (el campo 'r')
    es juicio, no dato: se conserva la que ya está escrita.
    """
    rows = notion(token, (
        'SELECT "Estado","Canal atribución","Total cobrado USD","Nombre" '
        'FROM "collection://%s"' % CRM
    ), ["collection://%s" % CRM])["results"]

    reales = [r for r in rows if r.get("Nombre")
              and "TEMPLATE" not in r["Nombre"].upper()
              and r.get("Canal atribución") != "Web"]

    revenue = sum(r.get("Total cobrado USD") or 0 for r in reales)
    activos = sum(1 for r in reales if r.get("Estado") == "🟢 Activo")

    calls = notion(token, (
        'SELECT date("date:Fecha:start") AS f, "Resultado" '
        'FROM "collection://%s" ORDER BY f' % LLAMADAS
    ), ["collection://%s" % LLAMADAS])["results"]

    fechas = sorted(c["f"] for c in calls if c.get("f"))
    if fechas:
        span = (date.fromisoformat(fechas[-1]) - date.fromisoformat(fechas[0])).days
        semanas = max(span / 7, 1)
        por_sem = round(len(calls) / semanas, 1)
    else:
        por_sem = 0

    cerradas = sum(1 for c in calls if c.get("Resultado") == "🟢 Cerrado")

    b = json.loads(json.dumps(previo))  # copia

    # El bloque comercial cambió de forma (ahora son ratios del ciclo, no
    # totales), así que se escribe por nombre de KPI y nunca por índice: si
    # falta uno, se salta en vez de pisar el que esté en esa posición.
    def set_kpi(clave, valor, pie=None):
        for t in b.get("stats", []) + b.get("kpis", []):
            if t["k"] == clave:
                t["v"] = valor
                if pie:
                    t["f"] = pie
                return

    set_kpi("Calls por semana", str(por_sem).replace(".", ","),
            "%d calls registradas" % len(calls))
    set_kpi("Close rate", "%d" % round(cerradas / max(len(calls), 1) * 100))

    # OJO: los canales NO se recalculan desde "Canal atribución".
    # Ese campo tiene 8 leads marcados "Referido" y solo uno lo es de verdad
    # (Emma Clara, vía Seba Garrido por LinkedIn); el resto es red personal mal
    # etiquetada. Reconstruir el bloque desde ahí volvería a inventar un motor
    # de referidos que no existe. El agrupamiento correcto se mantiene a mano
    # hasta que la etiqueta del CRM esté corregida en origen.

    return b, cerradas


# ─────────────────────────────────────────── main

def main():
    aplicar = "--aplicar" in sys.argv
    token = os.environ.get("NOTION_TOKEN")

    html = PANEL.read_text(encoding="utf-8")
    m = BLOQUE.search(html)
    if not m:
        raise SystemExit("No encontré el bloque pvt-data en %s" % PANEL)
    data = json.loads(m.group(2))


    data["infra"], n_skills, por_mes = bloque_build(data["infra"])
    if n_skills:
        propagar_skills(data, n_skills, por_mes)
        print("infra      ✓  %d skills contadas desde el filesystem" % n_skills)
    else:
        print("infra      —  no encontré ~/.claude/skills")


    if token:
        try:
            data["comercial"], cerradas = bloque_negocio(token, data["comercial"])
            print("comercial  ✓  CRM y llamadas recalculados (%d cierres)" % cerradas)
            n_al = date.today().isoformat()
        except (urllib.error.HTTPError, urllib.error.URLError, KeyError) as e:
            print("comercial  ✗  Notion falló (%s) — se conserva el bloque anterior" % e)
            n_al = None
    else:
        print("comercial  —  sin NOTION_TOKEN, se conserva el bloque anterior")
        print("marketing  —  sin NOTION_TOKEN, se conserva el bloque anterior")
        n_al = None

    hoy = date.today().isoformat()
    data["meta"]["fecha"] = datetime.now().strftime("%d·%m·%y")

    # El lag se recalcula SIEMPRE contra hoy, con o sin token. Antes solo se
    # tocaba al refrescar desde Notion, así que una fuente vieja seguía
    # diciendo "al día" — el semáforo mentía justo cuando más importaba.
    for f in data["meta"]["frescura"]:
        if f["n"].startswith("Filesystem"):
            f["al"] = hoy
        elif f["n"].startswith("CRM") and n_al:
            f["al"] = n_al
        f["lag"] = lag(f["al"])

    # "día X de Y" del mes en curso, para que no quede congelado
    import calendar
    h = date.today()
    if "tendencia" in data:
        data["tendencia"]["dias"] = "día %d de %d" % (
            h.day, calendar.monthrange(h.year, h.month)[1])

    # días desde el último contacto de cada cliente
    MESES_AB = {m: i + 1 for i, m in enumerate(ABREV)}
    for f in data.get("clientes", {}).get("fichas", []):
        t = (f.get("ult") or "").strip().lower().split()
        if len(t) == 2 and t[1][:3] in MESES_AB:
            try:
                d_ult = date(h.year, MESES_AB[t[1][:3]], int(t[0]))
                f["dias_sin"] = (h - d_ult).days
            except ValueError:
                pass


    nuevo = m.group(1) + "\n" + json.dumps(data, ensure_ascii=False, indent=2) + "\n" + m.group(3)

    if not aplicar:
        print("\n[en seco] Nada escrito. Corre con --aplicar para guardar.")
        return

    PANEL.write_text(html[: m.start()] + nuevo + html[m.end():], encoding="utf-8")
    print("\n✓ %s actualizado (%s)" % (PANEL.name, hoy))
    print("  Republicar el artifact con este archivo para que el panel muestre lo nuevo.")


if __name__ == "__main__":
    main()
