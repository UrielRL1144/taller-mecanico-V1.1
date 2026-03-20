// backend/src/controllers/reporteController.js
const pool = require('../models/db');

const getGananciasDelDia = async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(v.id) as total_operaciones,
                SUM(v.total_venta) as ingresos_totales,
                SUM(dv.cantidad * p.precio_compra) as costo_total_invertido,
                SUM(dv.cantidad * (dv.precio_unitario_momento - p.precio_compra)) as ganancia_neta
            FROM ventas v
            JOIN detalles_venta dv ON v.id = dv.venta_id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.fecha_hora >= CURRENT_DATE;
        `;
        
        const resultado = await pool.query(query);
        
        // Si no ha habido ventas hoy, los valores serán null, así que los formateamos
        const reporte = {
            operaciones: resultado.rows[0].total_operaciones || 0,
            ingresos: parseFloat(resultado.rows[0].ingresos_totales || 0),
            inversion_vendida: parseFloat(resultado.rows[0].costo_total_invertido || 0),
            ganancia: parseFloat(resultado.rows[0].ganancia_neta || 0)
        };

        res.json(reporte);
    } catch (err) {
        console.error('Error al generar reporte:', err);
        res.status(500).json({ error: 'Error al calcular reporte financiero' });
    }
};

module.exports = { getGananciasDelDia };