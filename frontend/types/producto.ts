// Product types
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria_id: number;
  activo: boolean;
  imagen_url?: string | null;
  categoria?: Categoria;
  variantes: Variante[];
  stock_total: number;
  pocas_unidades: boolean;
}

export interface Variante {
  id: number;
  producto_id: number;
  talla: string;
  color: string;
  stock: number;
  sku: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  padre_id?: number;
  complementos: string[];
}

// API Response types

export interface ProductoFilters {
  categoria_id?: number;
  talla?: string;
  color?: string;
  precio_min?: number;
  precio_max?: number;
  search?: string;
  limit: number;
  offset: number;
}