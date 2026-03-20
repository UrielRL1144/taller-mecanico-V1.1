// backend/src/controllers/ventaController.js
const pool = require('../models/db');

const registrarVenta = async (req, res) => {
    const { productos, metodo_pago, atendido_por } = req.body; 
    // 'productos' es un array de: { producto_id, cantidad, precio_unitario }

    const client = await pool.connect(); // Obtenemos un cliente del pool para la transacción

    try {
        await client.query('BEGIN'); // Inicio de la transacción

        // 1. Calcular el total de la venta
        const totalVenta = productos.reduce((acc, p) => acc + (p.cantidad * p.precio_unitario), 0);

        // 2. Insertar en la tabla 'ventas' (Cabecera)
        const nuevaVentaRes = await client.query(
            'INSERT INTO ventas (total_venta, metodo_pago, atendido_por) VALUES ($1, $2, $3) RETURNING id',
            [totalVenta, metodo_pago, atendido_por]
        );
        const ventaId = nuevaVentaRes.rows[0].id;

        // 3. Insertar detalles y actualizar stock de cada producto
        for (const prod of productos) {
            // Insertar detalle
            await client.query(
                'INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario_momento) VALUES ($1, $2, $3, $4)',
                [ventaId, prod.producto_id, prod.cantidad, prod.precio_unitario]
            );

            // Actualizar Stock (Restar)
            // Agregamos una condición: solo si hay stock suficiente
            const stockRes = await client.query(
                'UPDATE productos SET stock_actual = stock_actual - $1 WHERE id = $2 AND stock_actual >= $1 RETURNING nombre_tecnico',
                [prod.cantidad, prod.producto_id]
            );

            if (stockRes.rowCount === 0) {
                throw new Error(`Stock insuficiente para el producto ID: ${prod.producto_id}`);
            }
        }

        await client.query('COMMIT'); // Si todo salió bien, guardamos cambios
        res.status(201).json({ success: true, ventaId, total: totalVenta });

    } catch (err) {
        await client.query('ROLLBACK'); // Si algo falló, deshacemos todo
        console.error('Error en transacción de venta:', err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release(); // Liberar el cliente al pool
    }
};

module.exports = { registrarVenta };