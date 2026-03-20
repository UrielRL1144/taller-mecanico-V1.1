// backend/src/routes/proveedorRoutes.js
const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');

// Definir los "End Points" para proveedores
router.get('/', proveedorController.obtenerProveedores);
router.post('/', proveedorController.crearProveedor);
router.delete('/:id', proveedorController.eliminarProveedor);

module.exports = router;