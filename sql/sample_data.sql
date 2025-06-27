-- Script para insertar datos de ejemplo
-- Ejecutar después de create_tables.sql

-- ============================================
-- Insertar productos de ejemplo
-- ============================================

-- Verificar si ya existen productos
IF (SELECT COUNT(*) FROM productos) = 0
BEGIN
    INSERT INTO productos (nombre, precio, stock, descripcion, categoria) VALUES
    ('Laptop HP Pavilion 15', 899.99, 15, 'Laptop HP Pavilion 15 con procesador Intel Core i5, 8GB RAM, 512GB SSD', 'Electrónicos'),
    ('Mouse Logitech MX Master 3', 99.99, 50, 'Mouse inalámbrico ergonómico con tecnología MX Master', 'Accesorios'),
    ('Teclado Mecánico Corsair K95', 179.99, 25, 'Teclado mecánico RGB con switches Cherry MX', 'Accesorios'),
    ('Monitor Samsung 27" 4K', 349.99, 20, 'Monitor 4K de 27 pulgadas con tecnología HDR', 'Electrónicos'),
    ('Auriculares Sony WH-1000XM4', 299.99, 30, 'Auriculares inalámbricos con cancelación de ruido', 'Audio'),
    ('Webcam Logitech C920', 79.99, 40, 'Webcam Full HD 1080p para streaming y videollamadas', 'Accesorios'),
    ('SSD Samsung 1TB', 129.99, 60, 'Disco SSD de 1TB con tecnología NVMe', 'Almacenamiento'),
    ('Router ASUS AX6000', 199.99, 10, 'Router WiFi 6 de alta velocidad', 'Networking'),
    ('Tablet iPad Air', 599.99, 12, 'iPad Air con chip M1 y pantalla de 10.9 pulgadas', 'Electrónicos'),
    ('Cargador Inalámbrico Anker', 39.99, 80, 'Cargador inalámbrico rápido de 15W', 'Accesorios'),
    ('Cable USB-C 2m', 19.99, 100, 'Cable USB-C de 2 metros de longitud', 'Accesorios'),
    ('Funda Laptop 15"', 24.99, 45, 'Funda protectora para laptop de 15 pulgadas', 'Accesorios'),
    ('Batería Externa 20000mAh', 49.99, 35, 'Batería externa de alta capacidad con carga rápida', 'Accesorios'),
    ('Soporte para Laptop', 34.99, 25, 'Soporte ergonómico ajustable para laptop', 'Accesorios'),
    ('Micrófono Blue Yeti', 149.99, 18, 'Micrófono profesional USB para streaming y grabación', 'Audio');

    PRINT '✅ Productos de ejemplo insertados exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ Ya existen productos en la base de datos';
END

-- ============================================
-- Insertar un carrito de ejemplo
-- ============================================

DECLARE @carritoId INT;

-- Crear un carrito de ejemplo
INSERT INTO carritos (usuario_id, estado) VALUES (NULL, 'activo');
SET @carritoId = SCOPE_IDENTITY();

-- Añadir algunos productos al carrito
INSERT INTO carrito_productos (carrito_id, producto_id, cantidad) VALUES
(@carritoId, 1, 1), -- Laptop HP Pavilion 15
(@carritoId, 2, 2), -- Mouse Logitech MX Master 3
(@carritoId, 7, 1); -- SSD Samsung 1TB

PRINT '✅ Carrito de ejemplo creado con ID: ' + CAST(@carritoId AS VARCHAR(10));

-- ============================================
-- Mostrar resumen de datos insertados
-- ============================================

PRINT '';
PRINT '📊 RESUMEN DE DATOS INSERTADOS';
PRINT '=====================================';

DECLARE @totalProductos INT, @totalCarritos INT, @totalCarritoProductos INT;

SELECT @totalProductos = COUNT(*) FROM productos WHERE activo = 1;
SELECT @totalCarritos = COUNT(*) FROM carritos;
SELECT @totalCarritoProductos = COUNT(*) FROM carrito_productos;

PRINT 'Total de productos activos: ' + CAST(@totalProductos AS VARCHAR(10));
PRINT 'Total de carritos: ' + CAST(@totalCarritos AS VARCHAR(10));
PRINT 'Total de productos en carritos: ' + CAST(@totalCarritoProductos AS VARCHAR(10));

PRINT '';
PRINT '🎉 DATOS DE EJEMPLO INSERTADOS CORRECTAMENTE';
PRINT '=====================================';

-- Mostrar algunos productos insertados
PRINT '';
PRINT '📦 ALGUNOS PRODUCTOS DISPONIBLES:';
SELECT TOP 5 
    nombre, 
    precio, 
    stock, 
    categoria 
FROM productos 
WHERE activo = 1 
ORDER BY id;
