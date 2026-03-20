// backend/src/models/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Carga las variables del archivo .env

// Configuramos el "Pool" de conexiones
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Probamos la conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.stack);
  } else {
    console.log('✅ Conexión exitosa a PostgreSQL en:', res.rows[0].now);
  }
});

module.exports = pool;