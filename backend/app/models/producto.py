from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Category models
class CategoriaBase(BaseModel):
    nombre: str
    slug: str
    padre_id: Optional[int] = None
    complementos: List[str] = []

class CategoriaCreate(CategoriaBase):
    pass

class CategoriaUpdate(BaseModel):
    nombre: Optional[str] = None
    slug: Optional[str] = None
    padre_id: Optional[int] = None
    complementos: Optional[List[str]] = None

class CategoriaResponse(CategoriaBase):
    id: int

    class Config:
        from_attributes = True

# Variant models
class VarianteBase(BaseModel):
    talla: str
    color: str
    stock: int
    sku: str

class VarianteCreate(VarianteBase):
    pass

class VarianteUpdate(BaseModel):
    talla: Optional[str] = None
    color: Optional[str] = None
    stock: Optional[int] = None
    sku: Optional[str] = None

class VarianteResponse(VarianteBase):
    id: int
    producto_id: int

    class Config:
        from_attributes = True

# Product models
class ProductoBase(BaseModel):
    nombre: str
    descripcion: str
    precio: float
    categoria_id: int

class ProductoCreate(ProductoBase):
    activo: bool = True

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    categoria_id: Optional[int] = None
    activo: Optional[bool] = None

class ImagenProducto(BaseModel):
    id: int
    url: str
    orden: int

    class Config:
        from_attributes = True


class ProductoResponse(ProductoBase):
    id: int
    activo: bool
    imagen_url: Optional[str] = None
    imagenes: List[ImagenProducto] = []
    categoria: Optional[CategoriaResponse] = None
    variantes: List[VarianteResponse] = []
    stock_total: Optional[int] = None
    pocas_unidades: Optional[bool] = None

    class Config:
        from_attributes = True

# Filter models for catalog
class ProductoFilters(BaseModel):
    categoria_id: Optional[int] = None
    talla: Optional[str] = None
    color: Optional[str] = None
    precio_min: Optional[float] = None
    precio_max: Optional[float] = None
    search: Optional[str] = None  # Full-text search
    limit: int = 20
    offset: int = 0