const express = require('express');
const productRoutes = require('./products');
const cartRoutes = require('./cart');

const router = express.Router();

// Rutas principales
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

// Ruta de estado de la API
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Ruta de información de la API
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API REST para gestión de productos y carrito de compras',
        version: '1.0.0',
        endpoints: {
            products: '/api/v1/products',
            cart: '/api/v1/cart',
            health: '/api/v1/health'
        },
        documentation: 'Ver README.md para documentación completa'
    });
});

module.exports = router;
