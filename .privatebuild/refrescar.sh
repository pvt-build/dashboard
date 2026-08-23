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

# El mismo panel vive en Vercel bajo /dashboard. Se copia siempre para que las
# dos rutas no se separen; el deploy se dispara aparte con `desplegar-vercel.sh`.
VRC="../privatebuild-os/dashboard"
if [ -d "$VRC" ]; then
  cp index.html manifest.webmanifest icon.png "$VRC/"
  mkdir -p "$VRC/assets"
  cp -R assets/logos "$VRC/assets/"
  echo "Copia sincronizada en Webs/privatebuild-os/dashboard (falta desplegar a Vercel)."
fi
