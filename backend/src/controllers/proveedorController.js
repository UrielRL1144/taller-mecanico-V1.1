// backend/src/controllers/proveedorController.js
const pool = require('../models/db');

const obtenerProveedores = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM proveedores ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const crearProveedor = async (req, res) => {
    const { nombre, telefono, contacto_nombre } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO proveedores (nombre, telefono, contacto_nombre) VALUES ($1, $2, $3) RETURNING *',
            [nombre, telefono, contacto_nombre]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'El proveedor ya existe o hay un error de datos' });
    }
};

const eliminarProveedor = async (req, res) => {
    const { id } = req.params;

    try {
        // Intentamos eliminar
        const result = await pool.query('DELETE FROM proveedores WHERE id = $1', [id]);

        // Si rowCount es 0, significa que no encontró ese ID (aunque es raro si viene del frontend)
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }

        res.json({ message: "Proveedor eliminado correctamente" });

    } catch (error) {
        console.error("Error al eliminar proveedor:", error);

        // --- INGENIERÍA DE DATOS: MANEJO DE INTEGRIDAD ---
        // El código '23503' en PostgreSQL significa "Violación de llave foránea"
        // Es decir, hay productos que dependen de este proveedor.
        if (error.code === '23503') {
            return res.status(409).json({ 
                error: "No se puede eliminar: Este proveedor tiene productos asociados en el inventario. Elimina o reasigna los productos primero." 
            });
        }

        res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { obtenerProveedores, crearProveedor, eliminarProveedor };