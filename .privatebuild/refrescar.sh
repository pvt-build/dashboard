#!/bin/bash
# Refresca el panel y lo publica. Pensado para correr sin supervisión.
#
#   .privatebuild/refrescar.sh
#
# Si hay NOTION_TOKEN en el entorno, también baja CRM y contenido.
set -euo pipefail
cd "$(dirname "$0")/../../.."

python3 Webs/panel-troncal/.privatebuild/sync.py --aplicar

cd Webs/panel-troncal
if git diff --quiet; then
  echo "Sin cambios: el panel ya estaba al día."
  exit 0
fi
git add -A
git commit -q -m "Refresco automático · $(date +%d-%m-%Y)"
git push -q origin main
echo "Panel actualizado y publicado en https://pvt-build.github.io/dashboard/"
