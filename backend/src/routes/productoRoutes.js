// backend/src/routes/productoRoutes.js
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Definimos la ruta: GET /api/productos/buscar
router.get('/buscar', productoController.buscarProductos);
router.get('/', productoController.buscarProductos);
router.post('/', productoController.crearProducto);
router.put('/:id', productoController.actualizarProducto);
router.get('/verificar', productoController.verificarDuplicado);
router.get('/:id/historial', productoController.obtenerHistorialProducto);
router.delete('/:id', productoController.eliminarProducto);
router.put('/:id/reactivar', productoController.reactivarProducto);

module.exports = router;