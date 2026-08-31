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


# El mapa de tiempo lo mantiene pvt-arsenal-agent en su reference. El panel no
# es dueño de esos números: los lee. Así un cambio de cadencia se hace en un
# solo lugar y llega acá con un refresco, sin editar HTML a mano.
TIEMPO_MD = SKILLS / "pvt-arsenal-agent" / "references" / "tiempo.md"

# El área del encabezado se traduce al color que el panel ya usa por sistema.
CLAVE_AREA = {
    "Marketing": "mkt", "Setting": "cml", "Comercial": "cml",
    "Onboarding": "ent", "Producto": "prd", "Entrega": "ent",
    "Comunidad": "cmn", "Backend": "bkd",
}


def bloque_tiempo(previo):
    """
    Arma el árbol sistema → agente → skill → acción desde tiempo.md.
    Del archivo solo salen hechos (min, frec, manual, auto, métrica, impacto,
    qué falta). Leverage y veredicto los deriva el panel: si se escribieran
    acá habría dos lugares donde poder decir cosas distintas.
    """
    if not TIEMPO_MD.exists():
        return previo, None

    sistemas, sis, skill = [], None, None
    for linea in TIEMPO_MD.read_text(encoding="utf-8").splitlines():

        if linea.startswith("### "):
            # "### Marketing — Contenido · agente mano · urgencia alta"
            cab = linea[4:]
            area = cab.split("—")[0].strip()
            if area not in CLAVE_AREA:
                sis = None
                continue
            resto = cab.split("—", 1)[1] if "—" in cab else ""
            partes = [x.strip() for x in resto.split("·")]
            sis = {"a": area, "k": CLAVE_AREA[area],
                   "sis": partes[0] if partes else "",
                   "agente": next((x.replace("agente", "").strip()
                                   for x in partes if x.startswith("agente")), "mano"),
                   "urg": next((x.replace("urgencia", "").strip()
                                for x in partes if x.startswith("urgencia")), "media"),
                   "skills": []}
            sistemas.append(sis)
            skill = None
            continue

        if linea.startswith("#### ") and sis is not None:
            # "#### pvt-content-agent — decide qué se publica"
            cab = linea[5:]
            nom, rol = (cab.split("—", 1) + [""])[:2]
            skill = {"id": nom.strip(), "rol": rol.strip(), "acciones": []}
            sis["skills"].append(skill)
            continue

        if skill is None or not linea.startswith("|"):
            continue
        c = [x.strip() for x in linea.strip("|").split("|")]
        if len(c) < 8 or c[0] == "Acción" or set(c[0]) <= set("- :"):
            continue
        try:
            mi, fr, ma = int(c[1]), int(c[2]), int(c[3])
        except ValueError:
            continue
        skill["acciones"].append({
            "n": c[0], "min": mi, "frec": fr, "manual": ma,
            "auto": c[4], "met": c[5], "imp": c[6], "falta": c[7]})

    # una skill sin acciones no entra; un sistema sin skills tampoco
    for x in sistemas:
        x["skills"] = [k for k in x["skills"] if k["acciones"]]
    sistemas = [x for x in sistemas if x["skills"]]
    if not sistemas:
        return previo, None

    b = json.loads(json.dumps(previo))
    b["arbol"] = sistemas
    b.pop("sistemas", None)
    n = sum(len(k["acciones"]) for x in sistemas for k in x["skills"])
    return b, n


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

    # Backend cuenta sistemas por área, no skills sueltas: el conteo sale de
    # recorrer las 8 áreas y clasificar por estado.
    areas = b.get("areas", [])
    activos = sum(1 for a in areas if a.get("e") == "live")
    a_medias = sum(1 for a in areas if a.get("e") == "mid")
    por_activar = sum(1 for a in areas if a.get("e") == "brk")
    replicables = sum(1 for a in areas if a.get("cli"))

    def set_stat(clave, valor, pie=None):
        for t in b.get("stats", []):
            if t["k"] == clave:
                t["v"] = str(valor)
                if pie:
                    t["f"] = pie
                return

    n = len(areas) or 8
    set_stat("Sistemas activos", "%d" % activos)
    set_stat("A medias", "%d" % a_medias)
    set_stat("Por construir", "%d" % por_activar)
    set_stat("Replicables a cliente", "%d" % replicables)
    for t in b.get("stats", []):
        if t["k"] in ("Sistemas activos", "A medias", "Por construir",
                      "Replicables a cliente"):
            t["u"] = "/ %d" % n

    return b, len(dirs), por_mes


def propagar_skills(data, n_skills, por_mes):
    """
    El conteo de skills se cita en tres lugares fuera del bloque infra. Son
    textos de juicio, así que solo se les cambia el número — no la frase.
    """
    patron = re.compile(r"\b\d+ skills\b")
    # el radar se dibuja desde radar.areas: hay una sola lista que tocar
    for a in data["radar"].get("areas", []):
        if a["n"] in ("Infra", "Backend"):
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


    data["backend"], n_skills, por_mes = bloque_build(data["backend"])
    if n_skills:
        propagar_skills(data, n_skills, por_mes)
        print("infra      ✓  %d skills contadas desde el filesystem" % n_skills)
    else:
        print("infra      —  no encontré ~/.claude/skills")

    if "tiempo" in data["backend"]:
        data["backend"]["tiempo"], n_corridas = bloque_tiempo(data["backend"]["tiempo"])
        if n_corridas:
            print("tiempo     ✓  %d acciones del árbol leídas de pvt-arsenal-agent" % n_corridas)
        else:
            print("tiempo     —  no encontré tiempo.md, se conserva el bloque anterior")


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
    # sello de build: sirve para saber si el navegador está mostrando lo último
    data["meta"]["build"] = datetime.now().strftime("%d%m.%H%M")

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
