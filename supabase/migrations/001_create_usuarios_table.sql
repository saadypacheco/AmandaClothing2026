-- Migration: 001_create_usuarios_table.sql
-- Description: Crea tabla de usuarios y tablas relacionadas
-- Date: 2026-03-27

-- Tabla de usuarios (perfil adicional a auth.users de Supabase)
CREATE TABLE usuarios (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
  whatsapp TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice en email para búsquedas rápidas
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Tabla de categorías
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  padre_id INTEGER REFERENCES categorias(id),
  complementos TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2) NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice en categoría para filtros
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_activo ON productos(activo);

-- Tabla de variantes (talla, color, stock)
CREATE TABLE variantes (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talla TEXT NOT NULL,
  color TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsqueda de variantes por producto
CREATE INDEX idx_variantes_producto ON variantes(producto_id);

-- RLS: Enable on usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios
CREATE POLICY "Users can view their own profile" 
  ON usuarios FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON usuarios FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON usuarios FOR SELECT 
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on productos (read-only for all)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" 
  ON productos FOR SELECT 
  USING (activo = TRUE);

CREATE POLICY "Only admins can modify products" 
  ON productos FOR ALL 
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on categorias (read-only for all)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" 
  ON categorias FOR SELECT 
  USING (TRUE);

CREATE POLICY "Only admins can modify categories" 
  ON categorias FOR ALL 
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );

-- RLS: Enable on variantes
ALTER TABLE variantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view variantes of active products" 
  ON variantes FOR SELECT 
  USING (
    (SELECT activo FROM productos WHERE id = producto_id) = TRUE
  );

CREATE POLICY "Only admins can modify variantes" 
  ON variantes FOR ALL 
  USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'admin'
  );
