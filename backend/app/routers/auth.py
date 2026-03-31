from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
from app.models.usuario import LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, UsuarioResponse
from app.db.client import get_supabase_client
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer()
settings = get_settings()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Valida el JWT token y devuelve el usuario actual"""
    token = credentials.credentials
    supabase = get_supabase_client()
    
    try:
        user = supabase.auth.get_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado o inválido"
        )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Inicia sesión con email y contraseña"""
    supabase = get_supabase_client()
    
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Email o contraseña incorrectos"
            )
        
        # Obtener perfil del usuario
        user_data = supabase.table("usuarios").select("*").eq("id", response.user.id).single().execute()
        
        return LoginResponse(
            access_token=response.session.access_token,
            token_type="bearer",
            user=UsuarioResponse(
                id=user_data.data["id"],
                email=user_data.data["email"],
                nombre=user_data.data.get("nombre"),
                rol=user_data.data.get("rol", "cliente"),
                whatsapp=user_data.data.get("whatsapp"),
                created_at=user_data.data.get("created_at")
            )
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al iniciar sesión: {str(e)}"
        )

@router.post("/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    """Registra un nuevo usuario"""
    supabase = get_supabase_client()
    
    try:
        # Crear usuario en Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "nombre": request.nombre,
                }
            }
        })
        
        if not auth_response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el usuario"
            )
        
        # Crear perfil en tabla usuarios
        usuario_response = supabase.table("usuarios").insert({
            "id": auth_response.user.id,
            "email": auth_response.user.email,
            "nombre": request.nombre,
            "rol": "cliente",
            "whatsapp": request.whatsapp
        }).execute()
        
        return RegisterResponse(
            user=UsuarioResponse(
                id=usuario_response.data[0]["id"],
                email=usuario_response.data[0]["email"],
                nombre=usuario_response.data[0].get("nombre"),
                rol=usuario_response.data[0].get("rol", "cliente"),
                whatsapp=usuario_response.data[0].get("whatsapp"),
                created_at=usuario_response.data[0].get("created_at")
            ),
            message="Usuario registrado. Por favor confirma tu email"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al registrarse: {str(e)}"
        )

@router.get("/me", response_model=UsuarioResponse)
async def get_me(user = Depends(get_current_user)):
    """Obtiene los datos del usuario autenticado"""
    supabase = get_supabase_client()
    
    try:
        user_data = supabase.table("usuarios").select("*").eq("id", user.id).single().execute()
        
        return UsuarioResponse(
            id=user_data.data["id"],
            email=user_data.data["email"],
            nombre=user_data.data.get("nombre"),
            rol=user_data.data.get("rol", "cliente"),
            whatsapp=user_data.data.get("whatsapp"),
            created_at=user_data.data.get("created_at")
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al obtener usuario: {str(e)}"
        )

@router.post("/logout")
async def logout(user = Depends(get_current_user)):
    """Cierra sesión del usuario"""
    supabase = get_supabase_client()
    
    try:
        supabase.auth.sign_out()
        return {"message": "Sesión cerrada"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al cerrar sesión: {str(e)}"
        )
