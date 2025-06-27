-- Script para crear las tablas necesarias para la API REST
-- Base de datos: SQL Server

-- ============================================
-- Tabla: productos
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='productos' AND xtype='U')
BEGIN
    CREATE TABLE productos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(255) NOT NULL,
        precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
        stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
        descripcion NVARCHAR(MAX),
        categoria NVARCHAR(100) DEFAULT 'General',
        fecha_creacion DATETIME2 DEFAULT GETDATE(),
        fecha_modificacion DATETIME2,
        activo BIT DEFAULT 1
    );
    
    PRINT '✅ Tabla productos creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla productos ya existe';
END

-- ============================================
-- Tabla: carritos
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carritos' AND xtype='U')
BEGIN
    CREATE TABLE carritos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NULL, -- NULL para carritos sin usuario específico
        fecha_creacion DATETIME2 DEFAULT GETDATE(),
        fecha_modificacion DATETIME2,
        fecha_finalizacion DATETIME2,
        estado NVARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'abandonado')),
        total DECIMAL(10,2) DEFAULT 0,
        datos_compra NVARCHAR(MAX) -- JSON con datos adicionales de la compra
    );
    
    PRINT '✅ Tabla carritos creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla carritos ya existe';
END

-- ============================================
-- Tabla: carrito_productos
-- ============================================
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carrito_productos' AND xtype='U')
BEGIN
    CREATE TABLE carrito_productos (
        id INT IDENTITY(1,1) PRIMARY KEY,
        carrito_id INT NOT NULL,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL CHECK (cantidad > 0),
        fecha_agregado DATETIME2 DEFAULT GETDATE(),
        
        -- Claves foráneas
        FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        
        -- Restricción única para evitar duplicados
        UNIQUE(carrito_id, producto_id)
    );
    
    PRINT '✅ Tabla carrito_productos creada exitosamente';
END
ELSE
BEGIN
    PRINT '⚠️ La tabla carrito_productos ya existe';
END

-- ============================================
-- Índices para optimizar consultas
-- ============================================

-- Índices para la tabla productos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_nombre')
BEGIN
    CREATE INDEX IX_productos_nombre ON productos(nombre);
    PRINT '✅ Índice IX_productos_nombre creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_categoria')
BEGIN
    CREATE INDEX IX_productos_categoria ON productos(categoria);
    PRINT '✅ Índice IX_productos_categoria creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_activo')
BEGIN
    CREATE INDEX IX_productos_activo ON productos(activo);
    PRINT '✅ Índice IX_productos_activo creado';
END

-- Índices para la tabla carritos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_carritos_estado')
BEGIN
    CREATE INDEX IX_carritos_estado ON carritos(estado);
    PRINT '✅ Índice IX_carritos_estado creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_carritos_usuario_estado')
BEGIN
    CREATE INDEX IX_carritos_usuario_estado ON carritos(usuario_id, estado);
    PRINT '✅ Índice IX_carritos_usuario_estado creado';
END

-- Índices para la tabla carrito_productos
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_carrito_productos_carrito')
BEGIN
    CREATE INDEX IX_carrito_productos_carrito ON carrito_productos(carrito_id);
    PRINT '✅ Índice IX_carrito_productos_carrito creado';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_carrito_productos_producto')
BEGIN
    CREATE INDEX IX_carrito_productos_producto ON carrito_productos(producto_id);
    PRINT '✅ Índice IX_carrito_productos_producto creado';
END

-- ============================================
-- Triggers para auditoría
-- ============================================

-- Trigger para actualizar fecha_modificacion en productos
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_productos_update')
BEGIN
    EXEC('
    CREATE TRIGGER tr_productos_update
    ON productos
    AFTER UPDATE
    AS
    BEGIN
        UPDATE productos 
        SET fecha_modificacion = GETDATE()
        FROM productos p
        INNER JOIN inserted i ON p.id = i.id
    END
    ');
    PRINT '✅ Trigger tr_productos_update creado';
END

-- Trigger para actualizar fecha_modificacion en carritos
IF NOT EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_carritos_update')
BEGIN
    EXEC('
    CREATE TRIGGER tr_carritos_update
    ON carritos
    AFTER UPDATE
    AS
    BEGIN
        UPDATE carritos 
        SET fecha_modificacion = GETDATE()
        FROM carritos c
        INNER JOIN inserted i ON c.id = i.id
    END
    ');
    PRINT '✅ Trigger tr_carritos_update creado';
END

PRINT '';
PRINT '🎉 SCRIPT DE CREACIÓN DE TABLAS COMPLETADO';
PRINT '================================================';
PRINT 'Tablas creadas:';
PRINT '- productos';
PRINT '- carritos'; 
PRINT '- carrito_productos';
PRINT '';
PRINT 'La base de datos está lista para usar con la API.';
PRINT '================================================';
