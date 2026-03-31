# auth-supabase.md

## Autenticación con Supabase

### Flujo

1. **Frontend**: Usuario ingresa email y contraseña en `/login` o `/registro`
2. **Supabase Auth**: Maneja la autenticación (JWT tokens)
3. **Backend**: Ruta protegida `/auth/me` valida el token
4. **Base de datos**: Tabla `usuarios` almacena perfil adicional

### Rutas del backend

#### POST /auth/login
Inicia sesión usuario.
- **Request**: `{ email, password }`
- **Response**: `{ access_token, token_type, user }`
- **Errores**: 401 si credenciales inválidas

#### POST /auth/register
Registra nuevo usuario.
- **Request**: `{ email, password, nombre, whatsapp? }`
- **Response**: `{ user, message }`
- **Nota**: Usuario debe confirmar email antes de poder loguear

#### GET /auth/me
Obtiene datos del usuario autenticado.
- **Headers**: `Authorization: Bearer {token}`
- **Response**: `{ id, email, nombre, rol, whatsapp, created_at }`

#### POST /auth/logout
Cierra sesión. Requiere token válido.

### Hook useAuth (frontend)

```ts
const { user, loading, error, login, register, logout } = useAuth();

// Login
await login(email, password);

// Register
await register(email, password, nombre);

// Logout
await logout();
```

### Componentes UI

- **Button**: Primary, secondary, outline con estados
- **Input**: Con label, error handling y validación
- **AuthLayout**: Fondo gradiente para login/registro

### Variables de entorno necesarias

**Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Próximos pasos

1. Crear tabla `usuarios` en Supabase SQL
2. Configurar RLS en tabla `usuarios`
3. Crear índices en email (único)
4. Setear variábles de entorno reales
5. Testear login/registro completo
