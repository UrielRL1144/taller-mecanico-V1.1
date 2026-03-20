const express = require('express');
const router = express.Router();
const finanzasController = require('../controllers/finanzasController');

router.get('/resumen', finanzasController.obtenerResumenFinanciero);

module.exports = router;