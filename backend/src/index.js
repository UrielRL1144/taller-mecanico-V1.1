// backend/src/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./models/db'); // Importamos la conexión que acabamos de crear
const productoRoutes = require('./routes/productoRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const reporteRoutes = require('./routes/reporteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const finanzasRoutes = require('./routes/finanzasRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Permite recibir JSON en las peticiones

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor del Taller Zacapoaxtla funcionando 🚀');
});

app.use('/api/productos', productoRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/reportes', reporteRoutes);

app.use('/api/proveedores', proveedorRoutes);
app.use('/api/usuarios', usuarioRoutes);

app.use('/api/finanzas', finanzasRoutes);

// Arrancar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});