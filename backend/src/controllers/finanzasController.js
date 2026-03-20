const pool = require('../models/db');

const obtenerResumenFinanciero = async (req, res) => {
    try {
        // 1. KPI: VENTAS DE HOY (Suma total de dinero ingresado hoy)
        const ventasHoyQuery = `
            SELECT COALESCE(SUM(total), 0) as total_ventas 
            FROM ventas 
            WHERE DATE(fecha_venta) = CURRENT_DATE
        `;
        
        // 2. KPI: UTILIDAD DE HOY (Estimada: Precio Venta - Precio Compra Actual)
        // Nota: Un sistema perfecto guardaría el costo histórico en cada venta. 
        // Para este MVP, usamos el costo actual del producto para calcular el margen.
        const utilidadHoyQuery = `
            SELECT 
                COALESCE(SUM((dv.precio_unitario - p.precio_compra) * dv.cantidad), 0) as utilidad_bruta
            FROM detalle_ventas dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE DATE(v.fecha_venta) = CURRENT_DATE
        `;

        // 3. KPI: VALOR DEL INVENTARIO (Dinero parado en almacén)
        const valorInventarioQuery = `
            SELECT SUM(stock_actual * precio_compra) as capital_invertido 
            FROM productos 
            WHERE activo = TRUE
        `;

        // 4. GRÁFICA: ÚLTIMOS 7 DÍAS
        // Esta consulta agrupa las ventas por día
        const graficaQuery = `
            SELECT 
                TO_CHAR(DATE(fecha_venta), 'DD/MM') as fecha,
                SUM(total) as venta_total
            FROM ventas
            WHERE fecha_venta >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(fecha_venta)
            ORDER BY DATE(fecha_venta) ASC
        `;

        // EJECUTAMOS TODO EN PARALELO (Para máxima velocidad)
        const [ventasRes, utilidadRes, inventarioRes, graficaRes] = await Promise.all([
            pool.query(ventasHoyQuery),
            pool.query(utilidadHoyQuery),
            pool.query(valorInventarioQuery),
            pool.query(graficaQuery)
        ]);

        res.json({
            hoy: {
                venta: parseFloat(ventasRes.rows[0].total_ventas),
                utilidad: parseFloat(utilidadRes.rows[0].utilidad_bruta),
                transacciones: 0 // Podrías agregar un count(*) si quieres
            },
            inventario: {
                valor: parseFloat(inventarioRes.rows[0].capital_invertido || 0)
            },
            grafica: graficaRes.rows // Array [{ fecha: '05/02', venta_total: 1500 }, ...]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error calculando finanzas" });
    }
};

module.exports = { obtenerResumenFinanciero };