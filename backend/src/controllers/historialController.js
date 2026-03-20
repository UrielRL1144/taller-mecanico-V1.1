// Función para limpiar facturas antiguas y liberar espacio en Cloudinary
const limpiarHistorialAntiguo = async (req, res) => {
    try {
        // Buscamos movimientos de más de 6 meses que tengan factura_url
        const query = `
            SELECT factura_url_momento 
            FROM historial_movimientos 
            WHERE fecha_movimiento < NOW() - INTERVAL '6 months'
            AND factura_url_momento IS NOT NULL;
        `;
        const result = await pool.query(query);
        
        // Aquí iría la lógica para llamar a la API de Cloudinary y borrar el archivo físico
        // Por ahora, marcamos el historial como "Factura Expirada" en la DB
        const updateQuery = `
            UPDATE historial_movimientos 
            SET factura_url_momento = 'EXPIRADA_POR_TIEMPO'
            WHERE fecha_movimiento < NOW() - INTERVAL '6 months';
        `;
        await pool.query(updateQuery);

        res.json({ 
            mensaje: "Limpieza completada", 
            archivos_procesados: result.rows.length 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const cloudinary = require('../config/cloudinary');
const pool = require('../models/db');

const limpiarFacturasAntiguas = async (req, res) => {
    try {
        // 1. Buscamos facturas de hace más de 6 meses
        const query = `
            SELECT id, factura_url_momento 
            FROM historial_movimientos 
            WHERE fecha_movimiento < NOW() - INTERVAL '6 months'
            AND factura_url_momento IS NOT NULL 
            AND factura_url_momento LIKE 'http%'; 
        `;
        
        const { rows } = await pool.query(query);

        if (rows.length === 0) {
            return res.json({ mensaje: "No hay facturas antiguas para limpiar." });
        }

        const eliminados = [];

        // 2. Proceso de eliminación física en Cloudinary
        for (let row of rows) {
            // Extraemos el public_id de la URL (lógica simple de Cloudinary)
            // Ejemplo: .../upload/v1234/facturas/archivo.pdf -> facturas/archivo
            const urlParts = row.factura_url_momento.split('/');
            const fileName = urlParts[urlParts.length - 1].split('.')[0];
            const publicId = `facturas/${fileName}`;

            try {
                await cloudinary.uploader.destroy(publicId);
                
                // 3. Marcamos en la DB que el archivo ya no existe físicamente
                await pool.query(
                    "UPDATE historial_movimientos SET factura_url_momento = 'EXPIRADA' WHERE id = $1",
                    [row.id]
                );
                eliminados.push(row.id);
            } catch (errorCloud) {
                console.error(`Error borrando ${publicId}:`, errorCloud);
            }
        }

        res.json({
            mensaje: "Limpieza semestral completada",
            total_borrados: eliminados.length
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { limpiarFacturasAntiguas };