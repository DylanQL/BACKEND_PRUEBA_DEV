const CartModel = require('../models/Cart');
const ProductModel = require('../models/Product');

class CartController {

    // Obtener carrito activo
    async getActiveCart(req, res) {
        try {
            const { userId } = req.query;

            const cart = await CartModel.getActiveCart(userId ? parseInt(userId) : null);
            const cartSummary = await CartModel.getCartSummary(cart.id);

            res.status(200).json({
                success: true,
                message: 'Carrito obtenido exitosamente',
                data: cartSummary
            });

        } catch (error) {
            console.error('Error obteniendo carrito:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Añadir producto al carrito
    async addProduct(req, res) {
        try {
            const { productoId, cantidad = 1, userId } = req.body;

            // Validaciones
            if (!productoId) {
                return res.status(400).json({
                    success: false,
                    message: 'El ID del producto es obligatorio'
                });
            }

            if (cantidad <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad debe ser mayor a 0'
                });
            }

            // Verificar que el producto existe
            const product = await ProductModel.getById(parseInt(productoId));
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Verificar stock disponible
            const stockCheck = await ProductModel.checkStock(parseInt(productoId), parseInt(cantidad));
            if (!stockCheck.available) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente. Stock disponible: ${stockCheck.currentStock}`
                });
            }

            // Obtener o crear carrito activo
            const cart = await CartModel.getActiveCart(userId ? parseInt(userId) : null);

            // Añadir producto al carrito
            await CartModel.addProduct(cart.id, parseInt(productoId), parseInt(cantidad));

            // Obtener resumen actualizado del carrito
            const updatedCartSummary = await CartModel.getCartSummary(cart.id);

            res.status(200).json({
                success: true,
                message: 'Producto añadido al carrito exitosamente',
                data: updatedCartSummary
            });

        } catch (error) {
            console.error('Error añadiendo producto al carrito:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Actualizar cantidad de producto en el carrito
    async updateProductQuantity(req, res) {
        try {
            const { carritoId, productoId } = req.params;
            const { cantidad } = req.body;

            // Validaciones
            if (!carritoId || isNaN(parseInt(carritoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de carrito inválido'
                });
            }

            if (!productoId || isNaN(parseInt(productoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            if (cantidad < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'La cantidad no puede ser negativa'
                });
            }

            // Si la cantidad es 0, eliminar el producto
            if (cantidad === 0) {
                await CartModel.removeProduct(parseInt(carritoId), parseInt(productoId));
                
                const updatedCartSummary = await CartModel.getCartSummary(parseInt(carritoId));
                
                return res.status(200).json({
                    success: true,
                    message: 'Producto eliminado del carrito',
                    data: updatedCartSummary
                });
            }

            // Verificar stock disponible
            const stockCheck = await ProductModel.checkStock(parseInt(productoId), parseInt(cantidad));
            if (!stockCheck.available) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuficiente. Stock disponible: ${stockCheck.currentStock}`
                });
            }

            // Actualizar cantidad
            await CartModel.updateProductQuantity(
                parseInt(carritoId), 
                parseInt(productoId), 
                parseInt(cantidad)
            );

            // Obtener resumen actualizado del carrito
            const updatedCartSummary = await CartModel.getCartSummary(parseInt(carritoId));

            res.status(200).json({
                success: true,
                message: 'Cantidad actualizada exitosamente',
                data: updatedCartSummary
            });

        } catch (error) {
            console.error('Error actualizando cantidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar producto del carrito
    async removeProduct(req, res) {
        try {
            const { carritoId, productoId } = req.params;

            // Validaciones
            if (!carritoId || isNaN(parseInt(carritoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de carrito inválido'
                });
            }

            if (!productoId || isNaN(parseInt(productoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            await CartModel.removeProduct(parseInt(carritoId), parseInt(productoId));

            // Obtener resumen actualizado del carrito
            const updatedCartSummary = await CartModel.getCartSummary(parseInt(carritoId));

            res.status(200).json({
                success: true,
                message: 'Producto eliminado del carrito exitosamente',
                data: updatedCartSummary
            });

        } catch (error) {
            console.error('Error eliminando producto del carrito:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Vaciar carrito
    async clearCart(req, res) {
        try {
            const { carritoId } = req.params;

            if (!carritoId || isNaN(parseInt(carritoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de carrito inválido'
                });
            }

            await CartModel.clearCart(parseInt(carritoId));

            // Obtener resumen actualizado del carrito
            const updatedCartSummary = await CartModel.getCartSummary(parseInt(carritoId));

            res.status(200).json({
                success: true,
                message: 'Carrito vaciado exitosamente',
                data: updatedCartSummary
            });

        } catch (error) {
            console.error('Error vaciando carrito:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Finalizar compra
    async finalizePurchase(req, res) {
        try {
            const { carritoId } = req.params;
            const datosCompra = req.body;

            if (!carritoId || isNaN(parseInt(carritoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de carrito inválido'
                });
            }

            const purchase = await CartModel.finalizePurchase(parseInt(carritoId), datosCompra);

            res.status(200).json({
                success: true,
                message: 'Compra finalizada exitosamente',
                data: purchase
            });

        } catch (error) {
            console.error('Error finalizando compra:', error);
            
            if (error.message === 'El carrito está vacío') {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener historial de compras
    async getPurchaseHistory(req, res) {
        try {
            const { userId, page = 1, limit = 10 } = req.query;

            const offset = (page - 1) * limit;
            const history = await CartModel.getPurchaseHistory(
                userId ? parseInt(userId) : null, 
                parseInt(limit), 
                offset
            );

            res.status(200).json({
                success: true,
                message: 'Historial obtenido exitosamente',
                data: history,
                pagination: {
                    currentPage: parseInt(page),
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo historial:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener detalles de una compra
    async getPurchaseDetails(req, res) {
        try {
            const { carritoId } = req.params;

            if (!carritoId || isNaN(parseInt(carritoId))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de carrito inválido'
                });
            }

            const purchaseDetails = await CartModel.getPurchaseDetails(parseInt(carritoId));

            if (!purchaseDetails) {
                return res.status(404).json({
                    success: false,
                    message: 'Compra no encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Detalles de compra obtenidos exitosamente',
                data: purchaseDetails
            });

        } catch (error) {
            console.error('Error obteniendo detalles de compra:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new CartController();
