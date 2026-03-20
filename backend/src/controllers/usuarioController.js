const pool = require('../models/db');
const bcrypt = require('bcrypt');

// 1. Registrar Personal (con encriptación)
const crearUsuario = async (req, res) => {
    const { nombre_completo, usuario, password, rol } = req.body;
    
    try {
        // Encriptar la contraseña (salteo de 10 rondas)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO usuarios (nombre_completo, usuario, password, rol)
            VALUES ($1, $2, $3, $4) RETURNING id, nombre_completo, usuario, rol;
        `;
        
        const result = await pool.query(query, [nombre_completo, usuario, passwordHash, rol || 'empleado']);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Error de duplicado en Postgres
            return res.status(400).json({ error: "El nombre de usuario ya existe" });
        }
        res.status(500).json({ error: "Error al crear usuario" });
    }
};

// 2. Listar Personal (sin mostrar contraseñas por seguridad)
const obtenerUsuarios = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre_completo, usuario, rol FROM usuarios ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Login (Verificación de credenciales)
const login = async (req, res) => {
    const { usuario, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        const user = result.rows[0];
        // Comparar contraseña ingresada con el hash de la base de datos
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // Si es correcto, devolvemos los datos del usuario (menos el password)
        res.json({
            id: user.id,
            nombre_completo: user.nombre_completo,
            usuario: user.usuario,
            rol: user.rol
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { crearUsuario, obtenerUsuarios, login };