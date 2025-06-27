const express = require('express');
const ProductController = require('../controllers/ProductController');

const router = express.Router();

// Rutas para productos
router.post('/', ProductController.createProduct);
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.get('/:id/stock', ProductController.checkStock);

module.exports = router;
