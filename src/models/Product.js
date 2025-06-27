const database = require('../config/database');
const sql = require('mssql');

class ProductModel {
    
    // Crear un nuevo producto
    async create(productData) {
        const { nombre, precio, stock, descripcion, categoria } = productData;
        
        const query = `
            INSERT INTO productos (nombre, precio, stock, descripcion, categoria, fecha_creacion, activo)
            OUTPUT INSERTED.*
            VALUES (@nombre, @precio, @stock, @descripcion, @categoria, GETDATE(), 1)
        `;
        
        const params = {
            nombre: sql.NVarChar(255),
            precio: sql.Decimal(10, 2),
            stock: sql.Int,
            descripcion: sql.NVarChar(sql.MAX),
            categoria: sql.NVarChar(100)
        };

        const result = await database.executeQuery(query, {
            nombre,
            precio,
            stock,
            descripcion,
            categoria
        });

        return result.recordset[0];
    }

    // Obtener todos los productos
    async getAll(filters = {}) {
        let query = `
            SELECT id, nombre, precio, stock, descripcion, categoria, fecha_creacion, activo
            FROM productos 
            WHERE activo = 1
        `;
        
        const params = {};

        // Filtro por nombre
        if (filters.nombre) {
            query += ` AND nombre LIKE @nombre`;
            params.nombre = `%${filters.nombre}%`;
        }

        // Filtro por categoría
        if (filters.categoria) {
            query += ` AND categoria = @categoria`;
            params.categoria = filters.categoria;
        }

        // Filtro por precio mínimo
        if (filters.precioMin) {
            query += ` AND precio >= @precioMin`;
            params.precioMin = filters.precioMin;
        }

        // Filtro por precio máximo
        if (filters.precioMax) {
            query += ` AND precio <= @precioMax`;
            params.precioMax = filters.precioMax;
        }

        query += ` ORDER BY fecha_creacion DESC`;

        const result = await database.executeQuery(query, params);
        return result.recordset;
    }

    // Obtener producto por ID
    async getById(id) {
        const query = `
            SELECT id, nombre, precio, stock, descripcion, categoria, fecha_creacion, activo
            FROM productos 
            WHERE id = @id AND activo = 1
        `;

        const result = await database.executeQuery(query, { id });
        return result.recordset[0];
    }

    // Buscar productos por nombre
    async searchByName(searchTerm) {
        const query = `
            SELECT id, nombre, precio, stock, descripcion, categoria, fecha_creacion, activo
            FROM productos 
            WHERE nombre LIKE @searchTerm AND activo = 1
            ORDER BY nombre
        `;

        const result = await database.executeQuery(query, { 
            searchTerm: `%${searchTerm}%` 
        });
        return result.recordset;
    }

    // Actualizar producto
    async update(id, productData) {
        const { nombre, precio, stock, descripcion, categoria } = productData;
        
        const query = `
            UPDATE productos 
            SET nombre = @nombre, 
                precio = @precio, 
                stock = @stock, 
                descripcion = @descripcion, 
                categoria = @categoria,
                fecha_modificacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id AND activo = 1
        `;

        const result = await database.executeQuery(query, {
            id,
            nombre,
            precio,
            stock,
            descripcion,
            categoria
        });

        return result.recordset[0];
    }

    // Eliminar producto (soft delete)
    async delete(id) {
        const query = `
            UPDATE productos 
            SET activo = 0, fecha_modificacion = GETDATE()
            OUTPUT INSERTED.id
            WHERE id = @id AND activo = 1
        `;

        const result = await database.executeQuery(query, { id });
        return result.recordset[0];
    }

    // Verificar stock disponible
    async checkStock(id, quantity) {
        const query = `
            SELECT stock 
            FROM productos 
            WHERE id = @id AND activo = 1
        `;

        const result = await database.executeQuery(query, { id });
        const product = result.recordset[0];
        
        if (!product) {
            return { available: false, message: 'Producto no encontrado' };
        }

        return {
            available: product.stock >= quantity,
            currentStock: product.stock,
            message: product.stock >= quantity ? 'Stock disponible' : 'Stock insuficiente'
        };
    }

    // Actualizar stock
    async updateStock(id, newStock) {
        const query = `
            UPDATE productos 
            SET stock = @newStock, fecha_modificacion = GETDATE()
            OUTPUT INSERTED.*
            WHERE id = @id AND activo = 1
        `;

        const result = await database.executeQuery(query, { id, newStock });
        return result.recordset[0];
    }
}

module.exports = new ProductModel();
