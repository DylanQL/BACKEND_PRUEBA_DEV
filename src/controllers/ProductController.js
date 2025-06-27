const ProductModel = require('../models/Product');

class ProductController {

    // Crear un nuevo producto
    async createProduct(req, res) {
        try {
            const { nombre, precio, stock, descripcion, categoria } = req.body;

            // Validaciones básicas
            if (!nombre || !precio || stock === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Los campos nombre, precio y stock son obligatorios'
                });
            }

            if (precio <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser mayor a 0'
                });
            }

            if (stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El stock no puede ser negativo'
                });
            }

            const productData = {
                nombre: nombre.trim(),
                precio: parseFloat(precio),
                stock: parseInt(stock),
                descripcion: descripcion ? descripcion.trim() : '',
                categoria: categoria ? categoria.trim() : 'General'
            };

            const newProduct = await ProductModel.create(productData);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: newProduct
            });

        } catch (error) {
            console.error('Error creando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener todos los productos
    async getAllProducts(req, res) {
        try {
            const { 
                nombre, 
                categoria, 
                precioMin, 
                precioMax,
                page = 1,
                limit = 10
            } = req.query;

            const filters = {};
            if (nombre) filters.nombre = nombre;
            if (categoria) filters.categoria = categoria;
            if (precioMin) filters.precioMin = parseFloat(precioMin);
            if (precioMax) filters.precioMax = parseFloat(precioMax);

            const products = await ProductModel.getAll(filters);

            // Paginación simple
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedProducts = products.slice(startIndex, endIndex);

            res.status(200).json({
                success: true,
                message: 'Productos obtenidos exitosamente',
                data: paginatedProducts,
                pagination: {
                    currentPage: parseInt(page),
                    totalItems: products.length,
                    totalPages: Math.ceil(products.length / limit),
                    itemsPerPage: parseInt(limit)
                }
            });

        } catch (error) {
            console.error('Error obteniendo productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Obtener producto por ID
    async getProductById(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const product = await ProductModel.getById(parseInt(id));

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Producto obtenido exitosamente',
                data: product
            });

        } catch (error) {
            console.error('Error obteniendo producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Buscar productos por nombre
    async searchProducts(req, res) {
        try {
            const { q } = req.query;

            if (!q || q.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'El término de búsqueda debe tener al menos 2 caracteres'
                });
            }

            const products = await ProductModel.searchByName(q.trim());

            res.status(200).json({
                success: true,
                message: `Se encontraron ${products.length} productos`,
                data: products
            });

        } catch (error) {
            console.error('Error buscando productos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Actualizar producto
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { nombre, precio, stock, descripcion, categoria } = req.body;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            // Verificar que el producto existe
            const existingProduct = await ProductModel.getById(parseInt(id));
            if (!existingProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Validaciones
            if (precio !== undefined && precio <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El precio debe ser mayor a 0'
                });
            }

            if (stock !== undefined && stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El stock no puede ser negativo'
                });
            }

            const updateData = {
                nombre: nombre ? nombre.trim() : existingProduct.nombre,
                precio: precio !== undefined ? parseFloat(precio) : existingProduct.precio,
                stock: stock !== undefined ? parseInt(stock) : existingProduct.stock,
                descripcion: descripcion !== undefined ? descripcion.trim() : existingProduct.descripcion,
                categoria: categoria ? categoria.trim() : existingProduct.categoria
            };

            const updatedProduct = await ProductModel.update(parseInt(id), updateData);

            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: updatedProduct
            });

        } catch (error) {
            console.error('Error actualizando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Eliminar producto
    async deleteProduct(req, res) {
        try {
            const { id } = req.params;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const deletedProduct = await ProductModel.delete(parseInt(id));

            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente',
                data: { id: deletedProduct.id }
            });

        } catch (error) {
            console.error('Error eliminando producto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    // Verificar stock
    async checkStock(req, res) {
        try {
            const { id } = req.params;
            const { cantidad = 1 } = req.query;

            if (!id || isNaN(parseInt(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de producto inválido'
                });
            }

            const stockInfo = await ProductModel.checkStock(parseInt(id), parseInt(cantidad));

            res.status(200).json({
                success: true,
                message: stockInfo.message,
                data: stockInfo
            });

        } catch (error) {
            console.error('Error verificando stock:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
}

module.exports = new ProductController();
