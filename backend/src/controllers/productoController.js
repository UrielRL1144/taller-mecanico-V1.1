// backend/src/controllers/productoController.js
const pool = require('../models/db');

// 1. VERIFICAR DUPLICADOS (Sin cambios)
const verificarDuplicado = async (req, res) => {
    const { columna, valor } = req.query; 
    try {
        const query = `SELECT id, nombre_tecnico FROM productos WHERE ${columna} = $1 LIMIT 1`;
        const result = await pool.query(query, [valor]);
        
        if (result.rows.length > 0) {
            return res.json({ existe: true, producto: result.rows[0] });
        }
        res.json({ existe: false });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. BUSCAR PRODUCTOS (Sin cambios)
// backend/src/controllers/productoController.js

const buscarProductos = async (req, res) => {
    const { termino, archivados, page = 1 } = req.query; // Recibimos 'page'
    
    const limit = 50; // Cantidad por carga
    const offset = (page - 1) * limit; // Cálculo del salto
    const estadoBuscado = archivados === 'true' ? 'FALSE' : 'TRUE';

    try {
        // 1. Consulta de Datos
        const query = `
            SELECT 
                p.*, 
                pr.nombre as nombre_proveedor,
                u.nombre_completo as nombre_usuario_registro
            FROM productos p
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            LEFT JOIN usuarios u ON p.registrado_por_id = u.id
            WHERE 
                p.activo = ${estadoBuscado} AND (
                    ($1::text IS NULL OR $1::text = '') OR
                    (
                        p.nombre_tecnico ILIKE $2 OR 
                        p.alias_comun ILIKE $2 OR 
                        p.codigo_barras ILIKE $2
                    )
                )
            ORDER BY p.id DESC
            LIMIT $3 OFFSET $4; -- <--- AQUÍ ESTÁ LA MAGIA
        `;
        
        const busqueda = `%${termino || ''}%`;
        const result = await pool.query(query, [termino, busqueda, limit, offset]);

        // 2. Consulta de Conteo (Para saber si hay más páginas)
        // Nota: Esto es opcional pero útil para saber cuándo esconder el botón "Cargar Más"
        // Por rendimiento simple, podemos asumir que si result.rows.length < 50, no hay más.
        
        res.json({
            productos: result.rows,
            hayMas: result.rows.length === limit // Si trajimos 50, asumimos que puede haber más
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al buscar productos' });
    }
};

// 3. CREAR PRODUCTO (MODIFICADO: Soporte para Galería)
const crearProducto = async (req, res) => {
    const { 
        codigo_barras, nombre_tecnico, alias_comun, descripcion, 
        stock_actual, stock_minimo, precio_compra, precio_venta, 
        categoria, proveedor_id, notas, ubicacion, unidad_medida,
        imagenes, // <--- AHORA RECIBIMOS EL ARRAY COMPLETO
        factura_url, registrado_por_id 
    } = req.body;

    try {
        // --- LÓGICA DE PROCESAMIENTO DE IMÁGENES ---
        // 1. Imagen Principal: Tomamos la URL de la primera foto (o null si no hay)
        const imagen_url_principal = (imagenes && imagenes.length > 0) ? imagenes[0].url : null;
        
        // 2. Galería: Guardamos TODO el array (URLs + Tokens) como JSON
        const galeria_json = JSON.stringify(imagenes || []);

        // Validación de ubicación por defecto
        const ubicacionFinal = ubicacion || 'Sin Asignar';

        const query = `
            INSERT INTO productos (
                codigo_barras, nombre_tecnico, alias_comun, descripcion, 
                stock_actual, stock_minimo, precio_compra, precio_venta, 
                categoria, proveedor_id, notas, ubicacion, unidad_medida,
                imagen_url,       -- Columna vieja (Solo string URL)
                galeria_imagenes, -- Columna nueva (JSON completo)
                factura_url, registrado_por_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
            RETURNING *;
        `;
        
        const result = await pool.query(query, [
            codigo_barras, nombre_tecnico, alias_comun, descripcion, 
            stock_actual, stock_minimo, precio_compra, precio_venta, 
            categoria, 
            proveedor_id === '0' || proveedor_id === '' ? null : proveedor_id, 
            notas,
            ubicacionFinal,
            unidad_medida, 
            imagen_url_principal, // $12: URL simple
            galeria_json,         // $13: JSON Completo
            factura_url, 
            registrado_por_id
        ]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al crear producto: ' + err.message });
    }
};

// 4. ACTUALIZAR (MODIFICADO: Soporte para Galería)
const actualizarProducto = async (req, res) => {
    const { id } = req.params;
    const datos = req.body; 
    const { usuario_id, motivo, proveedor_id_movimiento, factura_url_nueva, unidad_medida_nueva } = datos;

    try {
        // 1. OBTENER ESTADO ANTERIOR
        const productoAnteriorResult = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
        if (productoAnteriorResult.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        const productoAnterior = productoAnteriorResult.rows[0];

        // --- PRE-PROCESAMIENTO DE IMÁGENES ---
        // Si el frontend nos manda el array 'imagenes', preparamos los campos de BD
        if (datos.imagenes) {
            // Actualizamos la principal con la primera del array
            datos.imagen_url = (datos.imagenes.length > 0) ? datos.imagenes[0].url : '';
            // Actualizamos la galería con el JSON
            datos.galeria_imagenes = JSON.stringify(datos.imagenes);
        }

        // 2. CONSTRUCCIÓN DINÁMICA
        const camposPermitidos = [
            'nombre_tecnico', 'alias_comun', 'categoria', 'descripcion', 
            'imagen_url',      // URL Principal
            'galeria_imagenes',// <--- AHORA PERMITIMOS ESTO
            'precio_compra', 'precio_venta', 'stock_actual', 'stock_minimo', 
            'codigo_barras', 'proveedor_id', 'factura_url', 'ubicacion', 'unidad_medida' // <--- NUEVO CAMPO PERMITIDO
        ];

        const keys = [];
        const values = [];
        let index = 1;

        Object.keys(datos).forEach(key => {
            if (camposPermitidos.includes(key)) {
                keys.push(`${key} = $${index}`);
                values.push(datos[key]);
                index++;
            }
        });

        if (factura_url_nueva) {
             keys.push(`factura_url = $${index}`);
             values.push(factura_url_nueva);
             index++;
        }

        if (keys.length > 0) {
            values.push(id);
            const queryUpdate = `UPDATE productos SET ${keys.join(', ')} WHERE id = $${index}`;
            await pool.query(queryUpdate, values);
        }

        // 3. HISTORIAL (Sin cambios mayores, solo auditoría)
        if (usuario_id && motivo) {
            const insertHistorial = `
                INSERT INTO historial_movimientos 
                (producto_id, usuario_id, tipo_movimiento, cantidad_anterior, cantidad_nueva, motivo, precio_compra_anterior, precio_compra_nuevo, factura_url_momento, proveedor_id_movimiento)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `;

            const tipo = datos.stock_actual !== undefined && datos.stock_actual !== productoAnterior.stock_actual 
                ? 'REABASTECIMIENTO' : 'EDICIÓN';

            await pool.query(insertHistorial, [
                id, usuario_id, tipo,
                productoAnterior.stock_actual,
                datos.stock_actual !== undefined ? datos.stock_actual : productoAnterior.stock_actual,
                motivo,
                productoAnterior.precio_compra,
                datos.precio_compra !== undefined ? datos.precio_compra : productoAnterior.precio_compra,
                factura_url_nueva || null, 
                proveedor_id_movimiento || null 
            ]);
        }

        res.json({ message: "Producto actualizado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno al actualizar producto" });
    }
};

// ... (Resto de funciones: obtenerHistorial, eliminar, reactivar IGUALES) ...
const obtenerHistorialProducto = async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10; 
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    try {
        const query = `
            SELECT h.*, u.nombre_completo as nombre_usuario
            FROM historial_movimientos h
            LEFT JOIN usuarios u ON h.usuario_id = u.id
            WHERE h.producto_id = $1
            ORDER BY h.fecha_movimiento DESC
            LIMIT $2 OFFSET $3;
        `;
        const result = await pool.query(query, [id, limit, offset]);
        const totalQuery = await pool.query('SELECT COUNT(*) FROM historial_movimientos WHERE producto_id = $1', [id]);
        const totalItems = parseInt(totalQuery.rows[0].count);
        const hayMas = offset + limit < totalItems;
        res.json({ datos: result.rows, meta: { hayMas, totalItems } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener el historial" });
    }
};

const eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const existeProd = await pool.query('SELECT id FROM productos WHERE id = $1', [id]);
        if (existeProd.rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });

        const checkHistorial = await pool.query('SELECT count(*) FROM historial_movimientos WHERE producto_id = $1', [id]);
        const tieneHistorial = parseInt(checkHistorial.rows[0].count) > 0;

        if (tieneHistorial) {
            await pool.query('UPDATE productos SET activo = FALSE WHERE id = $1', [id]);
            return res.json({ tipo: 'ARCHIVADO', message: 'El producto se ha archivado por seguridad histórica.' });
        } else {
            await pool.query('DELETE FROM productos WHERE id = $1', [id]);
            return res.json({ tipo: 'ELIMINADO', message: 'Producto eliminado permanentemente.' });
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        res.status(500).json({ error: "Error interno" });
    }
};

const reactivarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE productos SET activo = TRUE WHERE id = $1', [id]);
        res.json({ message: "Producto restaurado." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al reactivar" });
    }
};

module.exports = { buscarProductos, crearProducto, actualizarProducto, verificarDuplicado, obtenerHistorialProducto, eliminarProducto, reactivarProducto };