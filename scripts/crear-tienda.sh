#!/usr/bin/env bash
# crear-tienda.sh — Crea el stack de una tienda nueva en /docker/<cliente>/
#
# Uso (en el VPS):
#   sudo bash crear-tienda.sh <cliente> <dominio> <wa_numero>
#
# Ejemplo:
#   sudo bash crear-tienda.sh lunaboutique lunaboutique.com.ar 5491199887766
#
# Lo que hace:
#   1. Clona el repo en /docker/<cliente>/
#   2. Genera docker-compose.yml con labels Traefik + dominio custom
#   3. Crea .env vacio (el usuario completa las keys de Supabase/Gemini)
#   4. Crea backend/.env vacio
#   5. Imprime los pasos pendientes manuales

set -euo pipefail

CLIENTE="${1:?Falta cliente. Uso: bash crear-tienda.sh <cliente> <dominio> <wa_numero>}"
DOMINIO="${2:?Falta dominio}"
WA="${3:?Falta numero WA}"

REPO_URL="https://github.com/saadypacheco/AmandaClothing2026.git"
DEST="/docker/${CLIENTE}"

if [ -d "$DEST" ]; then
  echo "ERROR: $DEST ya existe. Borra primero o usa otro nombre de cliente."
  exit 1
fi

echo "==> 1/5 Clonando repo en $DEST"
git clone --branch main --depth 1 "$REPO_URL" "$DEST"
cd "$DEST"

echo "==> 2/5 Generando docker-compose.yml personalizado"
cat > docker-compose.yml <<YAML
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ${CLIENTE}-backend
    restart: unless-stopped
    env_file:
      - ./backend/.env
    environment:
      SITE_URL: https://${DOMINIO}
      CORS_ORIGINS: https://${DOMINIO},https://www.${DOMINIO}
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik"
      - "traefik.http.routers.${CLIENTE}-api.rule=Host(\`api.${DOMINIO}\`)"
      - "traefik.http.routers.${CLIENTE}-api.entrypoints=websecure"
      - "traefik.http.routers.${CLIENTE}-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.${CLIENTE}-api.loadbalancer.server.port=8000"

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_SUPABASE_URL: \${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: \${NEXT_PUBLIC_SUPABASE_ANON_KEY}
        NEXT_PUBLIC_API_URL: https://api.${DOMINIO}
    container_name: ${CLIENTE}-frontend
    restart: unless-stopped
    environment:
      API_URL: http://backend:8000
    depends_on:
      - backend
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.docker.network=traefik"
      - "traefik.http.routers.${CLIENTE}-web.rule=Host(\`${DOMINIO}\`) || Host(\`www.${DOMINIO}\`)"
      - "traefik.http.routers.${CLIENTE}-web.entrypoints=websecure"
      - "traefik.http.routers.${CLIENTE}-web.tls.certresolver=letsencrypt"
      - "traefik.http.services.${CLIENTE}-web.loadbalancer.server.port=3000"

networks:
  traefik:
    external: true
    name: traefik
YAML

echo "==> 3/5 Generando .env templates (vacios)"
cat > .env <<ENV
# Build args del frontend Next.js (se inyectan en el bundle).
# Completar con las claves del proyecto Supabase del cliente:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ENV

cat > backend/.env <<ENV
# Runtime del backend FastAPI. Completar antes de levantar el stack.
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
GEMINI_API_KEY=
SITE_URL=https://${DOMINIO}
CORS_ORIGINS=https://${DOMINIO},https://www.${DOMINIO}
ENV

echo "==> 4/5 Generando seed SQL personalizado para el cliente"
cat > supabase/seed_cliente.sql <<SQL
-- Seed especifico de ${CLIENTE}. Correr en Supabase SQL editor DESPUES de las migraciones.
-- Sobreescribe los valores default de tienda_config con los del cliente.

UPDATE tienda_config SET valor = '${CLIENTE^}' WHERE clave = 'nombre_tienda';
UPDATE tienda_config SET valor = '${CLIENTE^}' WHERE clave = 'nombre_corto';
UPDATE tienda_config SET valor = '${WA}' WHERE clave = 'whatsapp_numero';
UPDATE tienda_config SET valor = 'https://${DOMINIO}' WHERE clave = 'sitio_url';
UPDATE tienda_config SET valor = '${CLIENTE^}' WHERE clave = 'hero_titulo';
UPDATE tienda_config SET valor = 'false' WHERE clave = 'onboarding_completado';
SQL

echo ""
echo "==========================================================="
echo "==> 5/5 Stack creado en $DEST"
echo "==========================================================="
echo ""
echo "PASOS PENDIENTES (manual):"
echo ""
echo "1. Crear proyecto Supabase para ${CLIENTE}:"
echo "   - Correr migraciones 001 a 014 en orden (supabase/migrations/)"
echo "   - Correr supabase/seed_cliente.sql"
echo "   - Copiar URL, anon_key, service_key al paso 2"
echo ""
echo "2. Completar las credenciales:"
echo "   nano $DEST/.env          # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY"
echo "   nano $DEST/backend/.env  # SUPABASE_*, JWT_SECRET, GEMINI_API_KEY"
echo ""
echo "3. DNS: apuntar @ y www de ${DOMINIO} y api.${DOMINIO} a este VPS (A record)"
echo ""
echo "4. Levantar el stack:"
echo "   cd $DEST && docker compose up -d --build"
echo ""
echo "5. Verificar HTTPS (puede tardar 30-60s en emitir cert):"
echo "   curl -I https://${DOMINIO}"
echo "   curl -I https://api.${DOMINIO}/health"
echo ""
echo "6. Login como admin en https://${DOMINIO}/admin/onboarding"
echo "   para terminar la personalizacion visual (logo, colores, textos)"
echo ""
