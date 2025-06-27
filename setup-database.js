const sql = require('mssql');
require('dotenv').config();

const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function createTables() {
    try {
        console.log('🔌 Conectando a SQL Server...');
        const pool = await sql.connect(config);
        console.log('✅ Conectado exitosamente');

        console.log('📝 Ejecutando script de creación de tablas...');

        // Script de creación de tabla productos
        const createProductsTable = `
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
        `;

        await pool.request().query(createProductsTable);

        // Script de creación de tabla carritos
        const createCartsTable = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carritos' AND xtype='U')
            BEGIN
                CREATE TABLE carritos (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    usuario_id INT NULL,
                    fecha_creacion DATETIME2 DEFAULT GETDATE(),
                    fecha_modificacion DATETIME2,
                    fecha_finalizacion DATETIME2,
                    estado NVARCHAR(50) DEFAULT 'activo' CHECK (estado IN ('activo', 'finalizado', 'abandonado')),
                    total DECIMAL(10,2) DEFAULT 0,
                    datos_compra NVARCHAR(MAX)
                );
                PRINT '✅ Tabla carritos creada exitosamente';
            END
            ELSE
            BEGIN
                PRINT '⚠️ La tabla carritos ya existe';
            END
        `;

        await pool.request().query(createCartsTable);

        // Script de creación de tabla carrito_productos
        const createCartProductsTable = `
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carrito_productos' AND xtype='U')
            BEGIN
                CREATE TABLE carrito_productos (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    carrito_id INT NOT NULL,
                    producto_id INT NOT NULL,
                    cantidad INT NOT NULL CHECK (cantidad > 0),
                    fecha_agregado DATETIME2 DEFAULT GETDATE(),
                    
                    FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
                    FOREIGN KEY (producto_id) REFERENCES productos(id),
                    
                    UNIQUE(carrito_id, producto_id)
                );
                PRINT '✅ Tabla carrito_productos creada exitosamente';
            END
            ELSE
            BEGIN
                PRINT '⚠️ La tabla carrito_productos ya existe';
            END
        `;

        await pool.request().query(createCartProductsTable);

        // Crear índices
        const createIndexes = `
            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_nombre')
            BEGIN
                CREATE INDEX IX_productos_nombre ON productos(nombre);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_categoria')
            BEGIN
                CREATE INDEX IX_productos_categoria ON productos(categoria);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_productos_activo')
            BEGIN
                CREATE INDEX IX_productos_activo ON productos(activo);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_carritos_estado')
            BEGIN
                CREATE INDEX IX_carritos_estado ON carritos(estado);
            END
        `;

        await pool.request().query(createIndexes);

        console.log('🎉 ¡Todas las tablas han sido creadas exitosamente!');
        console.log('📊 Estructura de base de datos lista para usar.');

        await pool.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creando las tablas:', error);
        process.exit(1);
    }
}

createTables();
