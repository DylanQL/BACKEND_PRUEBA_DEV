# 🚀 API REST - Gestión de Productos y Carrito de Compras

Una API RESTful desarrollada con Node.js, Express y SQL Server para gestionar productos y un sistema completo de carrito de compras.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Base de Datos](#-base-de-datos)
- [Uso](#-uso)
- [Endpoints](#-endpoints)
  - [Productos](#productos)
  - [Carrito de Compras](#carrito-de-compras)
- [Ejemplos de Uso](#-ejemplos-de-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)

## ✨ Características

### Gestión de Productos
- ✅ Crear nuevos productos
- ✅ Listar todos los productos con filtros
- ✅ Buscar productos por nombre o ID
- ✅ Actualizar información de productos
- ✅ Eliminar productos (soft delete)
- ✅ Verificación de stock disponible

### Sistema de Carrito de Compras
- ✅ Añadir productos al carrito
- ✅ Ver productos en el carrito
- ✅ Editar cantidad de productos en el carrito
- ✅ Eliminar productos del carrito
- ✅ Vaciar el carrito completamente
- ✅ Finalizar compra y guardar registro
- ✅ Consultar historial de compras
- ✅ Ver detalles de compras específicas

### Características Adicionales
- 🔒 Validaciones de datos robustas
- 📊 Manejo de errores centralizado
- 📝 Logging detallado de requests
- 🔄 Paginación en listados
- 🛡️ Middleware de seguridad
- 📱 Soporte para CORS

## 🛠 Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **SQL Server** - Base de datos
- **mssql** - Driver para SQL Server
- **dotenv** - Gestión de variables de entorno
- **cors** - Cross-Origin Resource Sharing
- **helmet** - Middleware de seguridad
- **morgan** - Logger de HTTP requests
- **nodemon** - Desarrollo con auto-reload

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/DylanQL/BACKEND_PRUEBA_DEV.git
cd BACKEND_PRUEBA
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar el archivo .env con tus credenciales
```

## 🎯 Configuración Inicial

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crear el archivo `.env` con las credenciales de la base de datos:
```env
PORT=3000
NODE_ENV=development
DB_SERVER=sql1004.site4now.net
DB_NAME=db_abb005_prueba
DB_USER=db_abb005_prueba_admin
DB_PASSWORD=holamundo666
DB_PORT=1433
API_PREFIX=/api/v1
```

### 3. Crear Tablas en la Base de Datos
```bash
node setup-database.js
```

### 4. Iniciar el Servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### 5. Probar la API
```bash
# Verificar estado
curl http://localhost:3000/api/v1/health

# Ver documentación
curl http://localhost:3000/api/v1
```

---

## ⚙️ Configuración

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Configuración del servidor
PORT=3000
NODE_ENV=development

# Configuración de la base de datos SQL Server
DB_SERVER=sql1004.site4now.net
DB_NAME=db_abb005_prueba
DB_USER=db_abb005_prueba_admin
DB_PASSWORD=holamundo666
DB_PORT=1433

# Configuración adicional
API_PREFIX=/api/v1
```

## 🗃️ Base de Datos

### Estructura de Tablas

La API utiliza las siguientes tablas en SQL Server:

#### Tabla `productos`
```sql
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
```

#### Tabla `carritos`
```sql
CREATE TABLE carritos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NULL,
    fecha_creacion DATETIME2 DEFAULT GETDATE(),
    fecha_modificacion DATETIME2,
    fecha_finalizacion DATETIME2,
    estado NVARCHAR(50) DEFAULT 'activo',
    total DECIMAL(10,2) DEFAULT 0,
    datos_compra NVARCHAR(MAX)
);
```

#### Tabla `carrito_productos`
```sql
CREATE TABLE carrito_productos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    carrito_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    fecha_agregado DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (carrito_id) REFERENCES carritos(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

### Ejecutar Scripts de Base de Datos

1. **Crear las tablas**
```bash
# Ejecutar el script sql/create_tables.sql en tu SQL Server
```

2. **Insertar datos de ejemplo (opcional)**
```bash
# Ejecutar el script sql/sample_data.sql en tu SQL Server
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor se iniciará en `http://localhost:3000` (o el puerto configurado en `.env`).

## 📡 Endpoints

### Base URL
```
http://localhost:3000/api/v1
```

### Estado de la API
- `GET /health` - Verificar estado de la API
- `GET /` - Información general de la API

---

## Productos

### 📦 Crear Producto
```http
POST /api/v1/products
Content-Type: application/json

{
  "nombre": "Laptop HP Pavilion",
  "precio": 899.99,
  "stock": 15,
  "descripcion": "Laptop HP con procesador Intel Core i5",
  "categoria": "Electrónicos"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": 1,
    "nombre": "Laptop HP Pavilion",
    "precio": 899.99,
    "stock": 15,
    "descripcion": "Laptop HP con procesador Intel Core i5",
    "categoria": "Electrónicos",
    "fecha_creacion": "2025-06-27T10:30:00.000Z",
    "activo": true
  }
}
```

### 📋 Listar Productos
```http
GET /api/v1/products
```

**Parámetros de consulta opcionales:**
- `nombre` - Filtrar por nombre
- `categoria` - Filtrar por categoría
- `precioMin` - Precio mínimo
- `precioMax` - Precio máximo
- `page` - Número de página (default: 1)
- `limit` - Productos por página (default: 10)

**Ejemplo:**
```http
GET /api/v1/products?categoria=Electrónicos&page=1&limit=5
```

### 🔍 Obtener Producto por ID
```http
GET /api/v1/products/1
```

### 🔎 Buscar Productos
```http
GET /api/v1/products/search?q=laptop
```

### ✏️ Actualizar Producto
```http
PUT /api/v1/products/1
Content-Type: application/json

{
  "nombre": "Laptop HP Pavilion 15",
  "precio": 799.99,
  "stock": 20
}
```

### 🗑️ Eliminar Producto
```http
DELETE /api/v1/products/1
```

### 📊 Verificar Stock
```http
GET /api/v1/products/1/stock?cantidad=5
```

---

## Carrito de Compras

### 🛒 Obtener Carrito Activo
```http
GET /api/v1/cart/active
```

**Parámetros de consulta opcionales:**
- `userId` - ID del usuario (opcional)

### ➕ Añadir Producto al Carrito
```http
POST /api/v1/cart/add-product
Content-Type: application/json

{
  "productoId": 1,
  "cantidad": 2,
  "userId": 123
}
```

### 📝 Actualizar Cantidad de Producto
```http
PUT /api/v1/cart/1/products/1
Content-Type: application/json

{
  "cantidad": 3
}
```

### ❌ Eliminar Producto del Carrito
```http
DELETE /api/v1/cart/1/products/1
```

### 🗑️ Vaciar Carrito
```http
DELETE /api/v1/cart/1/clear
```

### 💳 Finalizar Compra
```http
POST /api/v1/cart/1/checkout
Content-Type: application/json

{
  "nombre_cliente": "Juan Pérez",
  "email": "juan@email.com",
  "direccion": "Calle Principal 123",
  "metodo_pago": "tarjeta"
}
```

### 📜 Historial de Compras
```http
GET /api/v1/cart/history
```

**Parámetros de consulta opcionales:**
- `userId` - ID del usuario
- `page` - Número de página (default: 1)
- `limit` - Registros por página (default: 10)

### 📋 Detalles de Compra
```http
GET /api/v1/cart/purchase/1
```

## 💡 Ejemplos de Uso

### Flujo Completo de Compra

1. **Crear productos**
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mouse Gaming",
    "precio": 59.99,
    "stock": 25,
    "categoria": "Accesorios"
  }'
```

2. **Obtener carrito activo**
```bash
curl http://localhost:3000/api/v1/cart/active
```

3. **Añadir productos al carrito**
```bash
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": 2
  }'
```

4. **Finalizar compra**
```bash
curl -X POST http://localhost:3000/api/v1/cart/1/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_cliente": "Ana García",
    "email": "ana@email.com"
  }'
```

## 📁 Estructura del Proyecto

```
BACKEND_PRUEBA/
├── src/
│   ├── config/
│   │   └── database.js          # Configuración de BD
│   ├── controllers/
│   │   ├── ProductController.js # Lógica de productos
│   │   └── CartController.js    # Lógica de carrito
│   ├── middleware/
│   │   ├── errorHandler.js      # Manejo de errores
│   │   └── logger.js           # Logging
│   ├── models/
│   │   ├── Product.js          # Modelo de productos
│   │   └── Cart.js             # Modelo de carrito
│   ├── routes/
│   │   ├── index.js            # Rutas principales
│   │   ├── products.js         # Rutas de productos
│   │   └── cart.js             # Rutas de carrito
│   └── app.js                  # Aplicación principal
├── sql/
│   ├── create_tables.sql       # Script de creación
│   └── sample_data.sql         # Datos de ejemplo
├── .env                        # Variables de entorno
├── .gitignore                  # Archivos ignorados
├── package.json                # Dependencias
└── README.md                   # Documentación
```

## 📜 Scripts Disponibles

- `npm start` - Iniciar en producción
- `npm run dev` - Iniciar en desarrollo con nodemon
- `npm test` - Ejecutar tests (pendiente implementar)

## 🔧 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error en la petición (datos inválidos) |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |
| 503 | Servicio no disponible (BD) |

## 🐛 Manejo de Errores

Todas las respuestas de error siguen el siguiente formato:

```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles técnicos (solo en desarrollo)"
}
```

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- Validación de datos de entrada
- Parámetros SQL parametrizados
- CORS configurado
- Variables de entorno para credenciales

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la documentación
2. Verifica la configuración de la base de datos
3. Consulta los logs del servidor
4. Abre un issue en el repositorio

## 📄 Licencia

ISC License - Ver el archivo `package.json` para más detalles.

---

**Desarrollado con ❤️ por GitHub Copilot**