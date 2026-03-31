from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: Optional[str] = None
    whatsapp: Optional[str] = None

class UsuarioCreate(UsuarioBase):
    password: str

class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    whatsapp: Optional[str] = None

class UsuarioResponse(UsuarioBase):
    id: str
    rol: str
    created_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UsuarioResponse

class RegisterRequest(UsuarioCreate):
    pass

class RegisterResponse(BaseModel):
    user: UsuarioResponse
    message: str
