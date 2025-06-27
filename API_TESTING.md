# 🧪 Pruebas de la API - Ejemplos con cURL

Este archivo contiene ejemplos prácticos para probar todos los endpoints de la API usando cURL.

## 🚀 Antes de empezar

Asegúrate de que el servidor esté corriendo:
```bash
npm run dev
```

El servidor debe estar disponible en: `http://localhost:3000`

---

## 📊 Endpoints de Estado

### Verificar estado de la API
```bash
curl -X GET http://localhost:3000/api/v1/health
```

### Información general de la API
```bash
curl -X GET http://localhost:3000/api/v1
```

---

## 📦 Productos

### 1. Crear un producto
```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop HP Pavilion 15",
    "precio": 899.99,
    "stock": 15,
    "descripcion": "Laptop HP Pavilion 15 con procesador Intel Core i5, 8GB RAM, 512GB SSD",
    "categoria": "Electrónicos"
  }'
```

### 2. Crear varios productos de ejemplo
```bash
# Mouse Gaming
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mouse Gaming Logitech G502",
    "precio": 79.99,
    "stock": 50,
    "descripcion": "Mouse gaming con sensor de alta precisión",
    "categoria": "Accesorios"
  }'

# Teclado Mecánico
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Teclado Mecánico Corsair K95",
    "precio": 179.99,
    "stock": 25,
    "descripcion": "Teclado mecánico RGB con switches Cherry MX",
    "categoria": "Accesorios"
  }'

# Monitor
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Monitor Samsung 27\" 4K",
    "precio": 349.99,
    "stock": 20,
    "descripcion": "Monitor 4K de 27 pulgadas con tecnología HDR",
    "categoria": "Electrónicos"
  }'
```

### 3. Listar todos los productos
```bash
curl -X GET http://localhost:3000/api/v1/products
```

### 4. Listar productos con filtros
```bash
# Filtrar por categoría
curl -X GET "http://localhost:3000/api/v1/products?categoria=Electrónicos"

# Filtrar por rango de precio
curl -X GET "http://localhost:3000/api/v1/products?precioMin=50&precioMax=200"

# Paginación
curl -X GET "http://localhost:3000/api/v1/products?page=1&limit=3"

# Múltiples filtros
curl -X GET "http://localhost:3000/api/v1/products?categoria=Accesorios&precioMax=100&page=1&limit=5"
```

### 5. Buscar productos
```bash
# Buscar por nombre
curl -X GET "http://localhost:3000/api/v1/products/search?q=gaming"

# Buscar por parte del nombre
curl -X GET "http://localhost:3000/api/v1/products/search?q=laptop"
```

### 6. Obtener producto por ID
```bash
curl -X GET http://localhost:3000/api/v1/products/1
```

### 7. Actualizar producto
```bash
curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop HP Pavilion 15 Actualizada",
    "precio": 799.99,
    "stock": 30
  }'
```

### 8. Verificar stock
```bash
# Verificar stock para 1 unidad
curl -X GET "http://localhost:3000/api/v1/products/1/stock?cantidad=1"

# Verificar stock para 5 unidades
curl -X GET "http://localhost:3000/api/v1/products/1/stock?cantidad=5"
```

### 9. Eliminar producto
```bash
curl -X DELETE http://localhost:3000/api/v1/products/1
```

---

## 🛒 Carrito de Compras

### 1. Obtener carrito activo
```bash
curl -X GET http://localhost:3000/api/v1/cart/active
```

### 2. Obtener carrito activo para un usuario específico
```bash
curl -X GET "http://localhost:3000/api/v1/cart/active?userId=123"
```

### 3. Añadir productos al carrito
```bash
# Añadir laptop al carrito
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": 1
  }'

# Añadir mouse al carrito
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 2,
    "cantidad": 2
  }'

# Añadir teclado al carrito
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 3,
    "cantidad": 1
  }'
```

### 4. Actualizar cantidad de producto en carrito
```bash
# Cambiar cantidad del producto 2 en el carrito 1
curl -X PUT http://localhost:3000/api/v1/cart/1/products/2 \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 3
  }'

# Poner cantidad en 0 (elimina el producto)
curl -X PUT http://localhost:3000/api/v1/cart/1/products/2 \
  -H "Content-Type: application/json" \
  -d '{
    "cantidad": 0
  }'
```

### 5. Eliminar producto específico del carrito
```bash
curl -X DELETE http://localhost:3000/api/v1/cart/1/products/2
```

### 6. Vaciar carrito completamente
```bash
curl -X DELETE http://localhost:3000/api/v1/cart/1/clear
```

### 7. Finalizar compra
```bash
curl -X POST http://localhost:3000/api/v1/cart/1/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "nombre_cliente": "Juan Pérez",
    "email": "juan.perez@email.com",
    "telefono": "+1234567890",
    "direccion": "Calle Principal 123, Ciudad",
    "metodo_pago": "tarjeta_credito",
    "notas": "Entregar en horario de oficina"
  }'
```

### 8. Consultar historial de compras
```bash
# Historial general
curl -X GET http://localhost:3000/api/v1/cart/history

# Historial con paginación
curl -X GET "http://localhost:3000/api/v1/cart/history?page=1&limit=5"

# Historial de un usuario específico
curl -X GET "http://localhost:3000/api/v1/cart/history?userId=123"
```

### 9. Ver detalles de una compra específica
```bash
curl -X GET http://localhost:3000/api/v1/cart/purchase/1
```

---

## 🔄 Flujo Completo de Prueba

### Script completo para probar toda la funcionalidad:

```bash
#!/bin/bash

echo "🚀 Iniciando pruebas completas de la API..."

# 1. Verificar estado
echo "📊 Verificando estado de la API..."
curl -s http://localhost:3000/api/v1/health | python3 -m json.tool

# 2. Crear productos
echo -e "\n📦 Creando productos..."
curl -s -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Laptop Gaming",
    "precio": 1299.99,
    "stock": 10,
    "descripcion": "Laptop gaming de alta gama",
    "categoria": "Electrónicos"
  }' | python3 -m json.tool

curl -s -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mouse Inalámbrico",
    "precio": 49.99,
    "stock": 50,
    "descripcion": "Mouse inalámbrico ergonómico",
    "categoria": "Accesorios"
  }' | python3 -m json.tool

# 3. Listar productos
echo -e "\n📋 Listando productos..."
curl -s http://localhost:3000/api/v1/products | python3 -m json.tool

# 4. Obtener carrito activo
echo -e "\n🛒 Obteniendo carrito activo..."
curl -s http://localhost:3000/api/v1/cart/active | python3 -m json.tool

# 5. Añadir productos al carrito
echo -e "\n➕ Añadiendo productos al carrito..."
curl -s -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": 1
  }' | python3 -m json.tool

curl -s -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 2,
    "cantidad": 2
  }' | python3 -m json.tool

# 6. Ver carrito actualizado
echo -e "\n👀 Verificando carrito actualizado..."
curl -s http://localhost:3000/api/v1/cart/active | python3 -m json.tool

echo -e "\n✅ Pruebas completadas!"
```

---

## 🐛 Pruebas de Errores

### Casos de error comunes para validar:

```bash
# Error: Producto con datos inválidos
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "",
    "precio": -10,
    "stock": -5
  }'

# Error: Producto no encontrado
curl -X GET http://localhost:3000/api/v1/products/9999

# Error: Añadir producto inexistente al carrito
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 9999,
    "cantidad": 1
  }'

# Error: Cantidad inválida en carrito
curl -X POST http://localhost:3000/api/v1/cart/add-product \
  -H "Content-Type: application/json" \
  -d '{
    "productoId": 1,
    "cantidad": -5
  }'

# Error: Carrito inexistente
curl -X DELETE http://localhost:3000/api/v1/cart/9999/clear
```

---

## 📝 Notas

1. **ID de carrito**: El ID del carrito se obtiene del endpoint `GET /api/v1/cart/active`
2. **ID de producto**: Los ID de productos se generan automáticamente al crearlos
3. **Formato JSON**: Todos los POST/PUT requieren `Content-Type: application/json`
4. **Paginación**: Los parámetros `page` y `limit` son opcionales en los listados
5. **Filtros**: Se pueden combinar múltiples filtros en las consultas

## 🛠 Herramientas Recomendadas

- **cURL**: Para pruebas rápidas desde terminal
- **Postman**: Para pruebas más complejas y colecciones
- **HTTPie**: Alternativa más amigable a cURL
- **Insomnia**: IDE para APIs REST

¡La API está lista para ser probada! 🎉
