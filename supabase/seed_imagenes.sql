-- Seed: imágenes de productos para desarrollo
-- Ejecutar después de seed.sql y migración 010_producto_imagenes.sql
-- URLs de Unsplash verificadas (IDs reales de fotos de moda)

-- Limpiar si se ejecuta de nuevo
DELETE FROM producto_imagenes WHERE producto_id IN (1,2,3,4,5,6,7,8,9,10);

-- ── Producto 1: Remera Basic Negra (3 fotos) ─────────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(1, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80', 0),
(1, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', 1),
(1, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&q=80', 2);

-- ── Producto 2: Remera Blanca Oversize (2 fotos) ─────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(2, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80', 0),
(2, 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80', 1);

-- ── Producto 3: Pantalón Palazzo Negro (4 fotos) ─────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(3, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80', 0),
(3, 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=800&q=80', 1),
(3, 'https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80', 2),
(3, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80', 3);

-- ── Producto 4: Pantalón Skinny Azul (2 fotos) ───────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(4, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', 0),
(4, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', 1);

-- ── Producto 5: Vestido Midi Floral (3 fotos) ────────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(5, 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', 0),
(5, 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800&q=80', 1),
(5, 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80', 2);

-- ── Producto 6: Vestido Negro Elegante (4 fotos) ─────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(6, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', 0),
(6, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80', 1),
(6, 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80', 2),
(6, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80', 3);

-- ── Producto 7: Campera Jeans Clásica (2 fotos) ──────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(7, 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80', 0),
(7, 'https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80', 1);

-- ── Producto 8: Campera Negra Impermeable (3 fotos) ──────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(8, 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&q=80', 0),
(8, 'https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=800&q=80', 1),
(8, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 2);

-- ── Producto 9: Zapatillas Blancas Deportivas (3 fotos) ──────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 0),
(9, 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=80', 1),
(9, 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80', 2);

-- ── Producto 10: Botas Negras Largas (2 fotos) ───────────────────────────────
INSERT INTO producto_imagenes (producto_id, url, orden) VALUES
(10, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', 0),
(10, 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', 1);

-- ── Sincronizar imagen_url principal en tabla productos ───────────────────────
UPDATE productos SET imagen_url = (
  SELECT url FROM producto_imagenes
  WHERE producto_id = productos.id AND orden = 0
  LIMIT 1
)
WHERE id IN (1,2,3,4,5,6,7,8,9,10);
