# Deploy de cliente nuevo — Guia paso a paso

Onboardear un cliente nuevo toma entre **30 y 60 minutos**, la mayoria esperando
propagacion DNS y emision de certificado SSL.

## Pre-requisitos

- VPS Hostinger con Traefik corriendo (`/docker/traefik/`)
- Docker 27.5 (pinned, ver `project_vps_deploy.md` en memoria)
- Acceso root al VPS
- Dominio del cliente registrado y con DNS configurable
- Cuenta Supabase (plan Free alcanza para empezar)
- `GEMINI_API_KEY` (una por cliente, o compartida segun modelo de negocio)

---

## Paso 1 — Crear proyecto Supabase

1. Entrar a https://supabase.com/dashboard, New Project.
2. Nombre: `<cliente>-prod`. Region: Sao Paulo (latencia AR/BR).
3. Una vez creado, ir a **SQL Editor** y correr las 14 migraciones en orden:
   ```
   supabase/migrations/001_create_usuarios_table.sql
   supabase/migrations/002_create_pedidos_and_carrito.sql
   ... hasta ...
   supabase/migrations/014_add_branding_and_currency.sql
   ```
4. Correr `supabase/seed.sql` si el cliente quiere productos de ejemplo
   (opcional; puede empezar con catalogo vacio).
5. **Settings → API**: copiar `URL`, `anon public key`, `service_role key`.
6. **Settings → Auth → JWT Settings**: copiar `JWT Secret`.

---

## Paso 2 — Correr el script en el VPS

```bash
ssh root@76.13.234.191
cd /tmp && curl -O https://raw.githubusercontent.com/saadypacheco/AmandaClothing2026/main/scripts/crear-tienda.sh
bash crear-tienda.sh <cliente> <dominio> <wa_numero>
```

Ejemplo real:
```bash
bash crear-tienda.sh lunaboutique lunaboutique.com.ar 5491199887766
```

El script:
- Clona el repo en `/docker/<cliente>/`
- Genera `docker-compose.yml` con labels Traefik ya configurados para el dominio
- Crea `.env` y `backend/.env` vacios (listos para completar)
- Genera `supabase/seed_cliente.sql` con los valores iniciales de tienda_config

---

## Paso 3 — Completar credenciales

```bash
cd /docker/<cliente>
nano .env           # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
nano backend/.env   # SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET, GEMINI_API_KEY
```

Y en Supabase, SQL Editor, correr `supabase/seed_cliente.sql` (queda commiteado
en la carpeta del cliente).

---

## Paso 4 — DNS

En el panel DNS del registrar del dominio del cliente, crear:
- `A  @           → 76.13.234.191`
- `A  www         → 76.13.234.191`
- `A  api         → 76.13.234.191`

Esperar propagacion (5–30 min habitual). Verificar con:
```bash
nslookup -type=A <dominio>.com 8.8.8.8
nslookup -type=A api.<dominio>.com 8.8.8.8
```

Ambos deben resolver a `76.13.234.191` antes de continuar.

---

## Paso 5 — Levantar el stack

```bash
cd /docker/<cliente>
docker compose up -d --build
```

Ver logs hasta que Traefik emita el cert (30–90s):
```bash
docker logs traefik --tail 30 -f
```

Buscar lineas tipo `Successfully obtained certificate for <dominio>`.

---

## Paso 6 — Verificacion

```bash
curl -I https://<dominio>.com           # Esperar HTTP/2 200
curl -I https://api.<dominio>.com/health # Esperar HTTP/2 200
```

Abrir `https://<dominio>.com` en el navegador. Deberia verse la tienda
con los valores default de Amanda Clothing pero con el nombre y WA del cliente.

---

## Paso 7 — Crear usuario admin

En `/admin` no hay "crear admin" visual (intencional, para seguridad).
Se hace con SQL en Supabase:

1. El cliente se registra normalmente en `/registro`.
2. En Supabase SQL Editor:
   ```sql
   UPDATE usuarios SET rol = 'admin' WHERE email = 'email@cliente.com';
   ```
3. El cliente refresca el sitio y ve el link "Admin" en el Navbar.

---

## Paso 8 — Onboarding visual

El cliente entra a `https://<dominio>.com/admin/onboarding` y completa:
- Logo (upload)
- Paleta de colores
- Textos de home
- Configuracion de moneda (si no es ARS)
- Metodos de pago

Al terminar, el flag `onboarding_completado` pasa a `true` y la tienda queda lista.

---

## Troubleshooting

Si algo falla, revisar los **5 gotchas conocidos** en memoria
(`project_arquitectura_deploy.md`):
1. Docker 29 incompatible con Traefik → pinear a 27.5
2. SSR Next.js no puede usar URL publica → `API_URL=http://backend:8000` en compose
3. CORS multi-tenant → `CORS_ORIGINS` env var
4. Let's Encrypt rate limit (5 fallos/hora) → esperar cooldown
5. DNS NXDOMAIN aunque Hostinger diga Active → confirmar con `whois`

---

## Updates de codigo

Para actualizar la tienda del cliente cuando se mergea algo a `main`:

```bash
cd /docker/<cliente>
git pull
docker compose up -d --build
```

Solo backend:
```bash
docker compose up -d --build backend
```

Solo frontend:
```bash
docker compose up -d --build frontend
```
