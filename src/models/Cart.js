const database = require('../config/database');
const sql = require('mssql');

class CartModel {

    // Crear un nuevo carrito
    async createCart(userId = null) {
        const query = `
            INSERT INTO carritos (usuario_id, fecha_creacion, estado)
            OUTPUT INSERTED.*
            VALUES (@userId, GETDATE(), 'activo')
        `;

        const result = await database.executeQuery(query, { userId });
        return result.recordset[0];
    }

    // Obtener carrito activo (o crear uno nuevo si no existe)
    async getActiveCart(userId = null) {
        let query = `
            SELECT TOP 1 id, usuario_id, fecha_creacion, fecha_modificacion, estado, total
            FROM carritos 
            WHERE estado = 'activo'
        `;

        const params = {};

        if (userId) {
            query += ` AND usuario_id = @userId`;
            params.userId = userId;
        } else {
            query += ` AND usuario_id IS NULL`;
        }

        query += ` ORDER BY fecha_creacion DESC`;

        const result = await database.executeQuery(query, params);
        
        if (result.recordset.length === 0) {
            // Crear un nuevo carrito si no existe uno activo
            return await this.createCart(userId);
        }

        return result.recordset[0];
    }

    // Añadir producto al carrito
    async addProduct(carritoId, productoId, cantidad) {
        // Verificar si el producto ya existe en el carrito
        const existingQuery = `
            SELECT id, cantidad 
            FROM carrito_productos 
            WHERE carrito_id = @carritoId AND producto_id = @productoId
        `;

        const existing = await database.executeQuery(existingQuery, { carritoId, productoId });

        if (existing.recordset.length > 0) {
            // Si existe, actualizar la cantidad
            const newQuantity = existing.recordset[0].cantidad + cantidad;
            return await this.updateProductQuantity(carritoId, productoId, newQuantity);
        } else {
            // Si no existe, añadir nuevo producto
            const query = `
                INSERT INTO carrito_productos (carrito_id, producto_id, cantidad, fecha_agregado)
                OUTPUT INSERTED.*
                VALUES (@carritoId, @productoId, @cantidad, GETDATE())
            `;

            const result = await database.executeQuery(query, { carritoId, productoId, cantidad });
            
            // Actualizar el total del carrito
            await this.updateCartTotal(carritoId);
            
            return result.recordset[0];
        }
    }

    // Obtener productos del carrito
    async getCartProducts(carritoId) {
        const query = `
            SELECT 
                cp.id as carrito_producto_id,
                cp.cantidad,
                cp.fecha_agregado,
                p.id as producto_id,
                p.nombre,
                p.precio,
                p.descripcion,
                p.categoria,
                p.stock,
                (cp.cantidad * p.precio) as subtotal
            FROM carrito_productos cp
            INNER JOIN productos p ON cp.producto_id = p.id
            WHERE cp.carrito_id = @carritoId AND p.activo = 1
            ORDER BY cp.fecha_agregado DESC
        `;

        const result = await database.executeQuery(query, { carritoId });
        return result.recordset;
    }

    // Actualizar cantidad de producto en el carrito
    async updateProductQuantity(carritoId, productoId, nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            return await this.removeProduct(carritoId, productoId);
        }

        const query = `
            UPDATE carrito_productos 
            SET cantidad = @nuevaCantidad
            OUTPUT INSERTED.*
            WHERE carrito_id = @carritoId AND producto_id = @productoId
        `;

        const result = await database.executeQuery(query, { carritoId, productoId, nuevaCantidad });
        
        // Actualizar el total del carrito
        await this.updateCartTotal(carritoId);
        
        return result.recordset[0];
    }

    // Eliminar producto del carrito
    async removeProduct(carritoId, productoId) {
        const query = `
            DELETE FROM carrito_productos 
            OUTPUT DELETED.*
            WHERE carrito_id = @carritoId AND producto_id = @productoId
        `;

        const result = await database.executeQuery(query, { carritoId, productoId });
        
        // Actualizar el total del carrito
        await this.updateCartTotal(carritoId);
        
        return result.recordset[0];
    }

    // Vaciar carrito
    async clearCart(carritoId) {
        const query = `
            DELETE FROM carrito_productos 
            WHERE carrito_id = @carritoId
        `;

        await database.executeQuery(query, { carritoId });
        
        // Actualizar el total del carrito a 0
        await this.updateCartTotal(carritoId);
        
        return { message: 'Carrito vaciado exitosamente' };
    }

    // Actualizar total del carrito
    async updateCartTotal(carritoId) {
        const query = `
            UPDATE carritos 
            SET total = (
                SELECT ISNULL(SUM(cp.cantidad * p.precio), 0)
                FROM carrito_productos cp
                INNER JOIN productos p ON cp.producto_id = p.id
                WHERE cp.carrito_id = @carritoId AND p.activo = 1
            ),
            fecha_modificacion = GETDATE()
            WHERE id = @carritoId
        `;

        await database.executeQuery(query, { carritoId });
    }

    // Finalizar compra (guardar registro)
    async finalizePurchase(carritoId, datosCompra = {}) {
        try {
            // Obtener productos del carrito
            const productos = await this.getCartProducts(carritoId);
            
            if (productos.length === 0) {
                throw new Error('El carrito está vacío');
            }

            // Calcular total
            const total = productos.reduce((sum, item) => sum + item.subtotal, 0);

            // Actualizar estado del carrito
            const updateCartQuery = `
                UPDATE carritos 
                SET estado = 'finalizado', 
                    fecha_finalizacion = GETDATE(),
                    total = @total,
                    datos_compra = @datosCompra
                OUTPUT INSERTED.*
                WHERE id = @carritoId
            `;

            const result = await database.executeQuery(updateCartQuery, { 
                carritoId, 
                total,
                datosCompra: JSON.stringify(datosCompra)
            });

            return {
                carrito: result.recordset[0],
                productos: productos,
                total: total
            };
        } catch (error) {
            throw error;
        }
    }

    // Obtener historial de carritos finalizados
    async getPurchaseHistory(userId = null, limit = 10, offset = 0) {
        let query = `
            SELECT 
                c.id,
                c.usuario_id,
                c.fecha_creacion,
                c.fecha_finalizacion,
                c.total,
                c.datos_compra,
                COUNT(cp.id) as total_productos
            FROM carritos c
            LEFT JOIN carrito_productos cp ON c.id = cp.carrito_id
            WHERE c.estado = 'finalizado'
        `;

        const params = { limit, offset };

        if (userId) {
            query += ` AND c.usuario_id = @userId`;
            params.userId = userId;
        }

        query += `
            GROUP BY c.id, c.usuario_id, c.fecha_creacion, c.fecha_finalizacion, c.total, c.datos_compra
            ORDER BY c.fecha_finalizacion DESC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        `;

        const result = await database.executeQuery(query, params);
        return result.recordset;
    }

    // Obtener detalles de una compra específica
    async getPurchaseDetails(carritoId) {
        const cartQuery = `
            SELECT id, usuario_id, fecha_creacion, fecha_finalizacion, total, datos_compra
            FROM carritos 
            WHERE id = @carritoId AND estado = 'finalizado'
        `;

        const cartResult = await database.executeQuery(cartQuery, { carritoId });
        
        if (cartResult.recordset.length === 0) {
            return null;
        }

        const cart = cartResult.recordset[0];
        const products = await this.getCartProducts(carritoId);

        return {
            carrito: cart,
            productos: products
        };
    }

    // Obtener resumen del carrito
    async getCartSummary(carritoId) {
        const cartQuery = `
            SELECT id, usuario_id, fecha_creacion, fecha_modificacion, estado, total
            FROM carritos 
            WHERE id = @carritoId
        `;

        const cartResult = await database.executeQuery(cartQuery, { carritoId });
        
        if (cartResult.recordset.length === 0) {
            return null;
        }

        const cart = cartResult.recordset[0];
        const products = await this.getCartProducts(carritoId);

        return {
            carrito: cart,
            productos: products,
            resumen: {
                total_productos: products.length,
                cantidad_total: products.reduce((sum, item) => sum + item.cantidad, 0),
                total: products.reduce((sum, item) => sum + item.subtotal, 0)
            }
        };
    }
}

module.exports = new CartModel();
