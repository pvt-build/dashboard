#!/bin/bash
# Sube a producción el sitio privatebuild-os, que sirve el panel en /dashboard.
#
#   .privatebuild/desplegar-vercel.sh
#
# Corre `refrescar.sh` antes si quieres publicar datos nuevos: este script solo
# despliega lo que ya está en disco.
set -euo pipefail
cd "$(dirname "$0")/../../privatebuild-os"

if [ ! -f dashboard/index.html ]; then
  echo "Falta dashboard/index.html — corre primero refrescar.sh" >&2
  exit 1
fi

npx --yes vercel@latest deploy --prod --yes
