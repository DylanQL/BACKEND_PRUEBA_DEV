const express = require('express');
const CartController = require('../controllers/CartController');

const router = express.Router();

// Rutas para carrito
router.get('/active', CartController.getActiveCart);
router.post('/add-product', CartController.addProduct);
router.put('/:carritoId/products/:productoId', CartController.updateProductQuantity);
router.delete('/:carritoId/products/:productoId', CartController.removeProduct);
router.delete('/:carritoId/clear', CartController.clearCart);
router.post('/:carritoId/checkout', CartController.finalizePurchase);

// Rutas para historial de compras
router.get('/history', CartController.getPurchaseHistory);
router.get('/purchase/:carritoId', CartController.getPurchaseDetails);

module.exports = router;
