#!/usr/bin/env bash
# Sube el árbol de trabajo al VPS y levanta compose.yaml (db + api + web).
#
#   ./deploy.sh usuario@vps
#   ./deploy.sh usuario@vps /opt/solarbell
#
# La primera vez copia .env.example como .env y se detiene: hay que poner
# secretos reales en el servidor y volver a correr el script.
# El .env del VPS no se pisa ni se borra en los deploys siguientes.
#
# En el VPS: Docker con el plugin Compose, y el usuario en el grupo docker.
# El ESP32 sale a internet hacia este host (puerto WEB_PORT, por defecto 80).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-}"
DEST="${2:-/opt/solarbell}"

if [[ -z "$TARGET" || "$TARGET" == -h || "$TARGET" == --help ]]; then
  echo "Uso: $0 usuario@host [directorio-remoto]" >&2
  echo "     directorio-remoto por defecto: /opt/solarbell" >&2
  exit 2
fi

if [[ "$DEST" != /* ]]; then
  echo "El directorio remoto tiene que ser una ruta absoluta." >&2
  exit 2
fi

HOST="${TARGET#*@}"
HOST="${HOST%%:*}"

echo "→ $TARGET:$DEST"

ssh "$TARGET" "mkdir -p '$DEST'"

if ! ssh "$TARGET" "command -v docker >/dev/null && docker compose version >/dev/null"; then
  echo "En el VPS falta Docker o el plugin Compose (docker compose version)." >&2
  exit 1
fi

rsync -az --delete \
  --filter 'protect /.env' \
  --exclude '.git/' \
  --exclude '.env' \
  --exclude '.cursor/' \
  --exclude '.code-review-graph/' \
  --exclude 'graphify-out/' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude '.venv/' \
  --exclude '__pycache__/' \
  --exclude '.pytest_cache/' \
  --exclude 'frontend/docs/' \
  --exclude 'ESP32/' \
  --exclude '*.log' \
  -e ssh \
  "$ROOT/" "$TARGET:$DEST/"

if ! ssh "$TARGET" "test -f '$DEST/.env'"; then
  rsync -az -e ssh "$ROOT/.env.example" "$TARGET:$DEST/.env"
  echo "Creé $DEST/.env desde .env.example." >&2
  echo "Edita los secretos en el VPS y vuelve a correr el script." >&2
  exit 1
fi

if ssh "$TARGET" "grep -Eq 'cambia-esta-clave|cambia-esto-por-openssl' '$DEST/.env'"; then
  echo "El .env del VPS todavía tiene valores de .env.example. Cámbialos antes de desplegar." >&2
  exit 1
fi

ssh "$TARGET" "cd '$DEST' && docker compose -f compose.yaml up -d --build"

PORT="$(ssh "$TARGET" "awk -F= '/^WEB_PORT=/{print \$2}' '$DEST/.env'")"
PORT="${PORT:-80}"

ok=0
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if ssh "$TARGET" "curl -fsS 'http://127.0.0.1:${PORT}/api/health'" 2>/dev/null; then
    echo
    ok=1
    break
  fi
  sleep 2
done

if [[ "$ok" -ne 1 ]]; then
  echo "La API no respondió en http://127.0.0.1:${PORT}/api/health" >&2
  ssh "$TARGET" "cd '$DEST' && docker compose -f compose.yaml ps && docker compose -f compose.yaml logs --tail 40" >&2 || true
  exit 1
fi

cat <<EOF

Listo.
  App:  http://${HOST}:${PORT}/
  Health: http://${HOST}:${PORT}/api/health

ESP32 (configuracion.h), CLAVE_DISPOSITIVO igual a DEVICE_API_KEY del .env del VPS:
  SERVIDOR_DIRECCION "${HOST}"
  SERVIDOR_PUERTO ${PORT}
  SERVIDOR_USA_SSL 0
  WIFI_RED de la red 2.4 GHz del sitio
EOF
