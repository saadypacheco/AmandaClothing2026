import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, productos, admin, eventos, recomendaciones, pedidos, chat, config

app = FastAPI(
    title="Boutique API",
    description="API para tienda de moda online",
    version="0.1.0",
)

# CORS — orígenes configurables por env var (coma-separados)
_default_origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:3007",
]
_env_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
_allowed_origins = _default_origins + _env_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(admin.router)
app.include_router(eventos.router)
app.include_router(recomendaciones.router)
app.include_router(pedidos.router)
app.include_router(chat.router)
app.include_router(config.router)

@app.get("/categorias")
async def listar_categorias_publico():
    from app.db.client import get_supabase_client
    db = get_supabase_client()
    result = db.table('categorias').select('id, nombre, slug').order('nombre').execute()
    return result.data or []


@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Boutique API v0.1.0"}
