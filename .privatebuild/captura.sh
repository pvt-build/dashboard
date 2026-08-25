#!/bin/bash
# Mueve una captura adjuntada en la sesión al repo y la publica.
#
#   .privatebuild/captura.sh <slug> [archivo]
#
# Sin argumento de archivo toma la imagen más reciente adjuntada en la sesión.
# Aterrizan en ~/.claude/uploads/<sesión>/. Imprime la URL pública: ese es el
# insumo que Notion necesita para descargarla (ver CAPTURAS.md).
#
# El repo es público. No pasar por acá capturas con clientes ni montos.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
ORIGEN="${2:-}"
SLUG="${1:-}"

if [ -z "$SLUG" ]; then
  echo "Falta el slug. Uso: .privatebuild/captura.sh <slug> [archivo]" >&2
  exit 1
fi

if [ -z "$ORIGEN" ]; then
  ORIGEN="$(find "$HOME/.claude/uploads" /mnt/attach -type f \
    \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' \) \
    -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)"
fi

if [ -z "$ORIGEN" ] || [ ! -f "$ORIGEN" ]; then
  echo "No encuentro ninguna captura adjuntada. Adjuntá la imagen primero." >&2
  exit 1
fi

EXT="${ORIGEN##*.}"
[ "$EXT" = "$ORIGEN" ] && EXT="png"
DESTINO="assets/capturas/$(date +%Y-%m-%d)-${SLUG}.${EXT,,}"

cd "$REPO"
mkdir -p assets/capturas
cp "$ORIGEN" "$DESTINO"

git add "$DESTINO"
if git diff --cached --quiet -- "$DESTINO"; then
  echo "Esa captura ya estaba en el repo: $DESTINO"
else
  git commit -q -m "Captura · ${SLUG}"
  RAMA="$(git rev-parse --abbrev-ref HEAD)"
  git push -q -u origin "$RAMA"
fi

echo "$DESTINO"
echo "https://pvt-build.github.io/dashboard/${DESTINO}"
