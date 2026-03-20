-- 1. Tabla de Productos (Refacciones y Aceites)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE,
    nombre_tecnico VARCHAR(100) NOT NULL,
    alias_comun VARCHAR(100), -- Para cuando no saben el nombre técnico
    descripcion TEXT,         -- Para qué moto/carro sirve
    stock_actual INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 2, -- Para alertas de resurtido
    precio_compra DECIMAL(10, 2) NOT NULL, -- Inversión
    precio_venta DECIMAL(10, 2) NOT NULL,  -- Precio al público
    categoria VARCHAR(30) CHECK (categoria IN ('Refacción', 'Aceite', 'Accesorio', 'Mano de Obra'))
);

-- 2. Tabla de Ventas (Cabecera)
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_venta DECIMAL(10, 2) DEFAULT 0,
    metodo_pago VARCHAR(20) DEFAULT 'Efectivo',
    atendido_por VARCHAR(50) -- Nombre del trabajador
);

-- 3. Tabla de Detalles de Venta (Lo que rompe el "anotar como sea")
CREATE TABLE detalles_venta (
    id SERIAL PRIMARY KEY,
    venta_id INTEGER REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario_momento DECIMAL(10, 2) NOT NULL -- Se guarda para históricos
);


-- Actualización de la tabla para soportar la nueva estructura
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS imagen_url TEXT,
ADD COLUMN IF NOT EXISTS factura_url TEXT,
ADD COLUMN IF NOT EXISTS registrado_por_id INTEGER, -- Relación con futuros usuarios
ADD COLUMN IF NOT EXISTS notas TEXT,
ADD COLUMN IF NOT EXISTS fecha_ultima_edicion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Restricción para que el código de barras sea único a nivel de base de datos (Seguridad extra)
ALTER TABLE productos ADD CONSTRAINT unique_codigo_barras UNIQUE (codigo_barras);