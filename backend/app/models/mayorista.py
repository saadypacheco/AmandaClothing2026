from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ── Cuentas mayoristas ───────────────────────────────────────────────────────

class RegistroMayoristaRequest(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    razon_social: Optional[str] = None
    cuit: Optional[str] = None
    condicion_iva: Optional[str] = None
    telefono_contacto: Optional[str] = None
    direccion_fiscal: Optional[str] = None


class CuentaMayoristaResponse(BaseModel):
    id: str
    email: str
    nombre: Optional[str] = None
    tipo_cuenta: str
    estado_cuenta: str
    cuit: Optional[str] = None
    razon_social: Optional[str] = None
    condicion_iva: Optional[str] = None
    lista_precio_id: Optional[int] = None
    descuento_general: Optional[Decimal] = None
    condicion_pago_default: Optional[str] = None
    telefono_contacto: Optional[str] = None
    direccion_fiscal: Optional[str] = None
    notas_internas: Optional[str] = None
    aprobado_en: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AprobarCuentaRequest(BaseModel):
    lista_precio_id: int
    condicion_pago_default: str = "contado"
    descuento_general: Decimal = Decimal(0)
    limite_credito: Decimal = Decimal(0)
    dias_pago_default: int = 30
    notas_internas: Optional[str] = None


class CuentaUpdateRequest(BaseModel):
    razon_social: Optional[str] = None
    cuit: Optional[str] = None
    condicion_iva: Optional[str] = None
    lista_precio_id: Optional[int] = None
    descuento_general: Optional[Decimal] = None
    condicion_pago_default: Optional[str] = None
    telefono_contacto: Optional[str] = None
    direccion_fiscal: Optional[str] = None
    notas_internas: Optional[str] = None
    estado_cuenta: Optional[str] = None


# ── Listas de precios ────────────────────────────────────────────────────────

class ListaPrecioCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    es_default: bool = False
    activo: bool = True


class ListaPrecioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    es_default: bool
    activo: bool
    created_at: Optional[datetime] = None


class PrecioListaItem(BaseModel):
    producto_id: Optional[int] = None
    variante_id: Optional[int] = None
    precio: Decimal
    descuento_pct: Decimal = Decimal(0)


class PreciosBulkUpsert(BaseModel):
    lista_id: int
    items: List[PrecioListaItem]


# ── Cuenta corriente ─────────────────────────────────────────────────────────

class MovimientoCCCreate(BaseModel):
    cuenta_id: int
    tipo: str  # 'cargo' | 'pago' | 'nota_credito' | 'nota_debito'
    monto: Decimal
    pedido_id: Optional[int] = None
    descripcion: Optional[str] = None
    fecha_vencimiento: Optional[date] = None
    fecha_pago: Optional[date] = None
    comprobante_url: Optional[str] = None


class MovimientoCCResponse(BaseModel):
    id: int
    cuenta_id: int
    tipo: str
    monto: Decimal
    pedido_id: Optional[int] = None
    descripcion: Optional[str] = None
    fecha_vencimiento: Optional[date] = None
    fecha_pago: Optional[date] = None
    comprobante_url: Optional[str] = None
    created_at: Optional[datetime] = None


class CuentaCorrienteResponse(BaseModel):
    id: int
    usuario_id: str
    limite_credito: Decimal
    dias_pago_default: int
    saldo_actual: Decimal
    activo: bool


# ── Atributos dinámicos ──────────────────────────────────────────────────────

class AtributoDefinicionCreate(BaseModel):
    categoria_id: Optional[int] = None
    clave: str
    nombre: str
    tipo: str = "texto"  # 'texto' | 'numero' | 'select' | 'multi_select' | 'booleano'
    valores_permitidos: Optional[list] = None
    obligatorio: bool = False
    orden: int = 0


class AtributoDefinicionResponse(BaseModel):
    id: int
    categoria_id: Optional[int] = None
    clave: str
    nombre: str
    tipo: str
    valores_permitidos: Optional[list] = None
    obligatorio: bool
    orden: int


class AtributoValorVarianteSet(BaseModel):
    atributo_id: int
    valor: str
