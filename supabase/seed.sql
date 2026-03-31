-- Seed data - se ejecutará después de las migraciones
-- Este archivo contiene datos iniciales para desarrollo

-- Categorías de ejemplo
INSERT INTO categorias (nombre, slug, padre_id, complementos) VALUES
('Remeras', 'remeras', NULL, ARRAY['pantalones', 'camperas']),
('Pantalones', 'pantalones', NULL, ARRAY['remeras', 'calzado']),
('Vestidos', 'vestidos', NULL, ARRAY['calzado', 'bolsos']),
('Camperas', 'camperas', NULL, ARRAY['pantalones', 'remeras']),
('Calzado', 'calzado', NULL, ARRAY['vestidos', 'pantalones']),
('Bolsos', 'bolsos', NULL, ARRAY['vestidos', 'remeras']),
('Accesorios', 'accesorios', NULL, ARRAY[]::text[])
ON CONFLICT (slug) DO NOTHING;

-- Productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, activo) VALUES
('Remera Basic Negra', 'Remera básica de algodón 100% en color negro. Cómoda y versátil.', 2500, 1, TRUE),
('Remera Blanca Oversize', 'Remera oversize en color blanco, perfecto para combinar.', 2800, 1, TRUE),
('Pantalón Palazzo Negro', 'Pantalón palazzo elegante en color negro, cintura alta.', 4500, 2, TRUE),
('Pantalón Skinny Azul', 'Pantalón skinny en denim azul oscuro, muy ajustado.', 3800, 2, TRUE),
('Vestido Midi Floral', 'Vestido midi con estampado floral, perfecto para eventos.', 5500, 3, TRUE),
('Vestido Negro Elegante', 'Vestido negro ajustado, largo a la rodilla, elegante.', 6200, 3, TRUE),
('Campera Jeans Clásica', 'Campera jeans clásica azul, versátil y cómoda.', 4800, 4, TRUE),
('Campera Negra Impermeable', 'Campera impermeable en color negro, moderna.', 7500, 4, TRUE),
('Zapatillas Blancas Deportivas', 'Zapatillas blancas deportivas, livianas y cómodas.', 3500, 5, TRUE),
('Botas Negras Largas', 'Botas negras hasta la rodilla, tacón medio, elegantes.', 5800, 5, TRUE)
ON CONFLICT DO NOTHING;

-- Variantes de productos
INSERT INTO variantes (producto_id, talla, color, stock, sku) VALUES
(1, 'XS', 'Negro', 15, 'REM-BAS-NEG-XS'),
(1, 'S', 'Negro', 20, 'REM-BAS-NEG-S'),
(1, 'M', 'Negro', 25, 'REM-BAS-NEG-M'),
(1, 'L', 'Negro', 18, 'REM-BAS-NEG-L'),
(1, 'XL', 'Negro', 12, 'REM-BAS-NEG-XL'),
(2, 'S', 'Blanco', 10, 'REM-OVS-BLA-S'),
(2, 'M', 'Blanco', 15, 'REM-OVS-BLA-M'),
(2, 'L', 'Blanco', 12, 'REM-OVS-BLA-L'),
(3, '34', 'Negro', 8, 'PAN-PAL-NEG-34'),
(3, '36', 'Negro', 10, 'PAN-PAL-NEG-36'),
(3, '38', 'Negro', 7, 'PAN-PAL-NEG-38'),
(4, '32', 'Azul', 12, 'PAN-SKI-AZU-32'),
(4, '34', 'Azul', 15, 'PAN-SKI-AZU-34'),
(4, '36', 'Azul', 13, 'PAN-SKI-AZU-36'),
(5, 'S', 'Floral', 5, 'VES-MID-FLO-S'),
(5, 'M', 'Floral', 8, 'VES-MID-FLO-M'),
(5, 'L', 'Floral', 6, 'VES-MID-FLO-L'),
(6, 'XS', 'Negro', 4, 'VES-NEG-ELE-XS'),
(6, 'S', 'Negro', 6, 'VES-NEG-ELE-S'),
(7, 'XS', 'Azul', 3, 'CAM-JEA-AZU-XS'),
(7, 'S', 'Azul', 5, 'CAM-JEA-AZU-S'),
(7, 'M', 'Azul', 7, 'CAM-JEA-AZU-M'),
(8, 'XS', 'Negro', 2, 'CAM-NEG-IMP-XS'),
(8, 'S', 'Negro', 4, 'CAM-NEG-IMP-S'),
(9, '35', 'Blanco', 8, 'ZAP-BLA-DEP-35'),
(9, '36', 'Blanco', 10, 'ZAP-BLA-DEP-36'),
(9, '37', 'Blanco', 12, 'ZAP-BLA-DEP-37'),
(9, '38', 'Blanco', 9, 'ZAP-BLA-DEP-38'),
(10, '36', 'Negro', 6, 'BOT-NEG-LAR-36'),
(10, '37', 'Negro', 7, 'BOT-NEG-LAR-37'),
(10, '38', 'Negro', 5, 'BOT-NEG-LAR-38'),
(10, '39', 'Negro', 4, 'BOT-NEG-LAR-39')
ON CONFLICT (sku) DO NOTHING;

-- Lookbooks de ejemplo
INSERT INTO lookbooks (titulo, descripcion, portada_url, activo) VALUES
('Look Casual Chic', 'Un look casual pero elegante para el día a día', '/lookbooks/casual-chic.jpg', TRUE),
('Look de Fiesta', 'Outfits especiales para eventos y fiestas', '/lookbooks/fiesta.jpg', TRUE),
('Denim Lovers', 'Combinaciones con jeans para cualquier ocasión', '/lookbooks/denim.jpg', TRUE)
ON CONFLICT DO NOTHING;

-- Productos en lookbooks
INSERT INTO lookbook_productos (lookbook_id, producto_id, posicion) VALUES
(1, 1, 1),  -- Remera Basic Negra en Look Casual Chic
(1, 3, 2),  -- Pantalón Palazzo en Look Casual Chic
(1, 9, 3),  -- Zapatillas Blancas en Look Casual Chic
(2, 5, 1),  -- Vestido Midi Floral en Look de Fiesta
(2, 10, 2), -- Botas Negras en Look de Fiesta
(2, 6, 3),  -- Vestido Negro en Look de Fiesta
(3, 7, 1),  -- Campera Jeans en Denim Lovers
(3, 4, 2),  -- Pantalón Skinny en Denim Lovers
(3, 9, 3)   -- Zapatillas Blancas en Denim Lovers
ON CONFLICT DO NOTHING;
