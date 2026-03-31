# GitHub Secrets requeridos

Ir a: **Settings → Secrets and variables → Actions → New repository secret**

## Supabase
| Secret | Descripción |
|--------|-------------|
| `SUPABASE_URL` | URL del proyecto (https://xxx.supabase.co) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (solo backend) |
| `SUPABASE_ACCESS_TOKEN` | Token personal de Supabase CLI (supabase.com → Account → Access Tokens) |
| `SUPABASE_PROJECT_ID` | ID del proyecto (ej: gmwtanvhwblayomqkvev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Mismo que SUPABASE_URL (para el build del frontend) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |

## API
| Secret | Descripción |
|--------|-------------|
| `NEXT_PUBLIC_API_URL` | URL pública del backend en producción (ej: https://api.amandaclothing.com) |

## Deploy (VPS)
| Secret | Descripción |
|--------|-------------|
| `VPS_HOST` | IP o dominio del servidor |
| `VPS_USER` | Usuario SSH (ej: ubuntu) |
| `VPS_SSH_KEY` | Clave privada SSH (cat ~/.ssh/id_rsa) |

## MercadoPago
| Secret | Descripción |
|--------|-------------|
| `MP_ACCESS_TOKEN` | Access token de MercadoPago |
| `MP_WEBHOOK_SECRET` | Secret para validar webhooks |

## JWT
| Secret | Descripción |
|--------|-------------|
| `JWT_SECRET` | String largo y aleatorio para firmar tokens |
