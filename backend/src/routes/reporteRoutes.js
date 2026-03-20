const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/diario', reporteController.getGananciasDelDia);

module.exports = router;