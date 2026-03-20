INSERT INTO productos (codigo_barras, nombre_tecnico, alias_comun, descripcion, stock_actual, precio_compra, precio_venta, categoria)
VALUES ('750123456789', 'Aceite Italika 4T 20W50', 'Aceite Rojo', 'Aceite para motor de motoneta', 10, 85.00, 120.00, 'Aceite');

UPDATE productos
SET stock_actual = stock_actual + 15
WHERE codigo_barras = '750123456789';

UPDATE productos
SET stock


INSERT INTO productos (codigo_barras, nombre_tecnico, alias_comun, descripcion, stock_actual, precio_compra, precio_venta, categoria)
VALUES ('750123456790', 'Aceite Motul 4T 20W50', 'Aceite Azul', 'Aceite para motor de motocicleta', 50, 90.00, 160.00, 'Aceite');

INSERT INTO productos (codigo_barras, nombre_tecnico, alias_comun, descripcion, stock_actual, precio_compra, precio_venta, categoria)
VALUES ('750123456791', 'Aceite Gastrol 4T 20W50', 'Aceite Verde', 'Aceite para motor de motocicleta', 50, 110.00, 260.00, 'Aceite');

SELECT * FROM productos;

SELECT * FROM ventas;
SELECT * FROM detalles_venta;
SELECT * FROM proveedores;
SELECT stock_actual FROM productos WHERE id = 1;



-- Actualización de la tabla para soportar la nueva estructura




ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagen_url TEXT,
ADD COLUMN IF NOT EXISTS factura_url TEXT,
ADD COLUMN IF NOT EXISTS registrado_por_id INTEGER, 
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS fecha_ultima_edicion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;


ALTER TABLE productos ADD CONSTRAINT unique_codigo_barras UNIQUE (codigo_barras);



-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre_completo TEXT NOT NULL,
    usuario TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT DEFAULT 'empleado' -- 'admin' para el dueño, 'empleado' para mecánicos
);

-- Agregar columna de trazabilidad a productos
ALTER TABLE productos ADD COLUMN registrado_por_id INTEGER REFERENCES usuarios(id);

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'productos' AND column_name = 'registrado_por_id';


-- Insertamos al dueño con rol 'admin'
-- Nota: '1234' es solo un ejemplo, lo ideal es registrarlo 
-- desde la interfaz para que bcrypt encripte la clave.
INSERT INTO usuarios (nombre_completo, usuario, password, rol) 
VALUES ('Dueño Refaccionaria', 'admin', '1234', 'admin');

SELECT * FROM usuarios


CREATE TABLE historial_movimientos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_movimiento TEXT NOT NULL, -- 'REGISTRO', 'REABASTECIMIENTO', 'EDICIÓN', 'AJUSTE'
    cantidad_anterior INTEGER,
    cantidad_nueva INTEGER,
    precio_compra_anterior DECIMAL(10,2),
    precio_compra_nuevo DECIMAL(10,2),
    motivo TEXT,
    factura_url_momento TEXT, -- Captura la factura específica de este movimiento
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


SELECT * FROM proveedores;


ALTER TABLE historial_movimientos 
ADD COLUMN proveedor_id_movimiento INTEGER REFERENCES proveedores(id);

ALTER TABLE historial_movimientos 
ADD COLUMN factura_url_momento TEXT;



ALTER TABLE productos 
ADD COLUMN activo BOOLEAN DEFAULT TRUE;


ALTER TABLE productos 
ADD COLUMN galeria_imagenes JSONB DEFAULT '[]'::jsonb;

ALTER TABLE productos 
ADD COLUMN ubicacion VARCHAR(100) DEFAULT 'Sin Asignar';