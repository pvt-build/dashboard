#!/bin/bash
# Refresca el Business OS y lo deja publicado, sin supervisión.
#
#   bash ECOSISTEMA/panel-troncal/.privatebuild/refresco-diario.sh
#
# Hace las dos mitades que hoy se corren a mano:
#   1. sync.py     — recuenta skills, lee el Finance OS y el árbol de tiempo
#   2. publicar-os — sube exactamente lo commiteado al Founder OS
#
# NO está activado como tarea programada a propósito: primero se valida a mano
# unos días, después se automatiza. Para activarlo cuando corresponda:
#   crontab -e  →  0 7 * * *  bash "<ruta>/refresco-diario.sh" >> /tmp/pvt-os.log 2>&1
set -euo pipefail
PANEL="$(cd "$(dirname "$0")/.." && pwd)"
RAIZ="$(cd "$PANEL/../.." && pwd)"

bash "$PANEL/.privatebuild/refrescar.sh"

# El dashboard vive en el repo raíz: se commitea solo esa ruta para no arrastrar
# el trabajo sin cerrar de otras sesiones.
cd "$RAIZ"
if ! git diff --quiet -- ECOSISTEMA/privatebuild-os/dashboard; then
  git add ECOSISTEMA/privatebuild-os/dashboard
  git commit -q -m "Business OS: refresco automático $(date +%d-%m-%Y)"
fi

bash "$RAIZ/ECOSISTEMA/publicar-os.sh"
