-- ===================================
-- SCHEMA BASE DE DATOS - EL ARTESANO
-- ===================================

-- EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- TABLA: USUARIOS
-- ===================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('cliente', 'admin')),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT NOW(),
    ultima_sesion TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ===================================
-- TABLA: PRODUCTOS
-- ===================================
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    imagen_url TEXT,
    categoria VARCHAR(100),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para productos
CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_activo ON productos(activo);

-- ===================================
-- TABLA: CURSOS
-- ===================================
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    duracion_horas INTEGER,
    imagen_url TEXT,
    video_intro_url TEXT,
    contenido JSONB DEFAULT '[]',
    activo BOOLEAN DEFAULT TRUE,
    destacado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para cursos
CREATE INDEX idx_cursos_activo ON cursos(activo);
CREATE INDEX idx_cursos_destacado ON cursos(destacado);

-- ===================================
-- TABLA: ORDENES
-- ===================================
CREATE TABLE IF NOT EXISTS ordenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden VARCHAR(50) UNIQUE NOT NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Datos del cliente (duplicados para histórico)
    cliente_nombre VARCHAR(255) NOT NULL,
    cliente_email VARCHAR(255) NOT NULL,
    cliente_telefono VARCHAR(50),
    
    -- Montos
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    costo_envio DECIMAL(10, 2) DEFAULT 0 CHECK (costo_envio >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    
    -- Estado y pagos
    estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pendiente_pago', 'pagado', 'preparacion', 'enviado', 'entregado', 'cancelado')),
    metodo_pago VARCHAR(50) DEFAULT 'mercadopago' CHECK (metodo_pago IN ('mercadopago', 'transferencia', 'efectivo')),
    comprobante_url TEXT,
    notas_pago TEXT,
    
    -- Dirección de entrega
    direccion_entrega TEXT NOT NULL,
    ciudad VARCHAR(100),
    codigo_postal VARCHAR(20),
    notas TEXT,
    
    -- Timestamps
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_pago TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para ordenes
CREATE INDEX idx_ordenes_usuario ON ordenes(usuario_id);
CREATE INDEX idx_ordenes_estado ON ordenes(estado);
CREATE INDEX idx_ordenes_fecha ON ordenes(fecha_creacion DESC);
CREATE INDEX idx_ordenes_numero ON ordenes(numero_orden);

-- ===================================
-- TABLA: ORDEN_ITEMS
-- ===================================
CREATE TABLE IF NOT EXISTS orden_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
    
    -- Datos del producto (snapshot en el momento de la compra)
    producto_nombre VARCHAR(255) NOT NULL,
    producto_tipo VARCHAR(50) DEFAULT 'producto' CHECK (producto_tipo IN ('producto', 'curso')),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para orden_items
CREATE INDEX idx_orden_items_orden ON orden_items(orden_id);
CREATE INDEX idx_orden_items_producto ON orden_items(producto_id);

-- ===================================
-- TABLA: PAGOS
-- ===================================
CREATE TABLE IF NOT EXISTS pagos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID REFERENCES ordenes(id) ON DELETE CASCADE,
    
    -- Mercado Pago
    mercadopago_id VARCHAR(255),
    mercadopago_preference_id VARCHAR(255),
    
    -- Detalles del pago
    estado VARCHAR(50) DEFAULT 'pending' CHECK (estado IN ('pending', 'approved', 'rejected', 'cancelled', 'refunded', 'in_process')),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto >= 0),
    metodo VARCHAR(100),
    
    -- JSON completo de la respuesta de MP
    datos_json JSONB,
    
    -- Timestamps
    fecha_pago TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para pagos
CREATE INDEX idx_pagos_orden ON pagos(orden_id);
CREATE INDEX idx_pagos_mercadopago ON pagos(mercadopago_id);
CREATE INDEX idx_pagos_estado ON pagos(estado);

-- ===================================
-- TABLA: USUARIOS_CURSOS
-- ===================================
CREATE TABLE IF NOT EXISTS usuarios_cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
    
    -- Control de acceso
    fecha_compra TIMESTAMP DEFAULT NOW(),
    activo BOOLEAN DEFAULT TRUE,
    
    -- Progreso del curso
    progreso JSONB DEFAULT '{"lecciones_vistas": [], "porcentaje": 0}',
    completado BOOLEAN DEFAULT FALSE,
    fecha_completado TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(usuario_id, curso_id)
);

-- Índices para usuarios_cursos
CREATE INDEX idx_usuarios_cursos_usuario ON usuarios_cursos(usuario_id);
CREATE INDEX idx_usuarios_cursos_curso ON usuarios_cursos(curso_id);

-- ===================================
-- TABLA: ACCESOS_CURSOS (sin registro de usuario)
-- ===================================
CREATE TABLE IF NOT EXISTS accesos_cursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    orden_id UUID REFERENCES ordenes(id) ON DELETE SET NULL,
    
    -- Token de acceso
    token_acceso VARCHAR(255) UNIQUE NOT NULL,
    expira_en TIMESTAMP NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Progreso del curso
    progreso DECIMAL(5,2) DEFAULT 0.00 CHECK (progreso >= 0 AND progreso <= 100),
    completado BOOLEAN DEFAULT FALSE,
    ultimo_acceso TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para accesos_cursos
CREATE INDEX idx_accesos_cursos_email ON accesos_cursos(email);
CREATE INDEX idx_accesos_cursos_token ON accesos_cursos(token_acceso);
CREATE INDEX idx_accesos_cursos_curso_id ON accesos_cursos(curso_id);

-- ===================================
-- FUNCIONES Y TRIGGERS
-- ===================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_cursos_updated_at BEFORE UPDATE ON usuarios_cursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accesos_cursos_updated_at BEFORE UPDATE ON accesos_cursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- DATOS INICIALES
-- ===================================

-- Insertar usuario admin (password: Admin123!)
INSERT INTO usuarios (email, password_hash, nombre, telefono, rol)
VALUES (
    'admin@elartesano.com',
    '$2a$10$rKhXhIvZ3Z1lXJ9NJN5YV.pJFvVB8fJvRqBPZGYqYXhQZW5X8N8W6',
    'Administrador',
    '+5491112345678',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, imagen_url, categoria, stock, activo, destacado) VALUES
    ('Torta Artesanal', 'Exquisitas tortas para cada ocasión especial, elaboradas con ingredientes premium', 450, '/img/torta.jpg', 'Tortas', 10, true, true),
    ('Pan Artesanal', 'Variedad de panes tradicionales y especiales, horneados diariamente', 120, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 'Panes', 50, true, true),
    ('Sándwich de Miga', 'Frescos y deliciosos para tus eventos y reuniones especiales', 85, '/img/sandwich-miga.jpg', 'Sándwiches', 30, true, false),
    ('Facturas', 'Medialunas, vigilantes y más delicias para acompañar tu café matutino', 65, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 'Facturas', 100, true, true),
    ('Masas Secas', 'Dulces tentaciones para acompañar tu café, galletas y más', 95, '/img/masas secas.jpg', 'Masas', 40, true, false),
    ('Especialidad del Chef', 'Creaciones únicas y limitadas, especialmente diseñadas para sorprenderte', 200, 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600', 'Especialidades', 5, true, true)
ON CONFLICT DO NOTHING;

-- Insertar cursos de ejemplo
INSERT INTO cursos (titulo, descripcion, precio, duracion_horas, imagen_url, contenido, activo, destacado) VALUES
    (
        'Panadería Básica - Primeros Pasos',
        'Aprende los fundamentos de la panadería artesanal desde cero. Masa madre, fermentación y técnicas básicas.',
        2500,
        8,
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        '[
            {"titulo": "Introducción a la Panadería", "duracion": "30 min", "video_url": "", "material": []},
            {"titulo": "Masa Madre - Creación y Mantenimiento", "duracion": "45 min", "video_url": "", "material": []},
            {"titulo": "Técnicas de Amasado", "duracion": "60 min", "video_url": "", "material": []},
            {"titulo": "Fermentación y Levado", "duracion": "40 min", "video_url": "", "material": []},
            {"titulo": "Horneado Perfecto", "duracion": "35 min", "video_url": "", "material": []}
        ]'::jsonb,
        true,
        true
    ),
    (
        'Repostería Profesional',
        'Domina las técnicas de repostería fina: tortas, macarons, croissants y más.',
        3500,
        12,
        'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
        '[
            {"titulo": "Introducción a la Repostería", "duracion": "30 min", "video_url": "", "material": []},
            {"titulo": "Bases y Cremas", "duracion": "60 min", "video_url": "", "material": []},
            {"titulo": "Decoración Profesional", "duracion": "90 min", "video_url": "", "material": []},
            {"titulo": "Tortas de Capas", "duracion": "75 min", "video_url": "", "material": []},
            {"titulo": "Macarons y Petit Fours", "duracion": "85 min", "video_url": "", "material": []}
        ]'::jsonb,
        true,
        true
    ),
    (
        'Pan Artesanal Avanzado',
        'Lleva tus panes al siguiente nivel. Técnicas avanzadas, fermentaciones largas y panes especiales.',
        3000,
        10,
        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800',
        '[
            {"titulo": "Fermentaciones Largas", "duracion": "50 min", "video_url": "", "material": []},
            {"titulo": "Panes con Cereales", "duracion": "45 min", "video_url": "", "material": []},
            {"titulo": "Baguettes y Ciabatta", "duracion": "70 min", "video_url": "", "material": []},
            {"titulo": "Focaccia y Pizzas", "duracion": "55 min", "video_url": "", "material": []}
        ]'::jsonb,
        true,
        false
    )
ON CONFLICT DO NOTHING;

-- ===================================
-- VISTAS ÚTILES
-- ===================================

-- Vista de resumen de ventas
CREATE OR REPLACE VIEW vista_ventas_resumen AS
SELECT 
    DATE(o.fecha_creacion) as fecha,
    COUNT(DISTINCT o.id) as total_ordenes,
    SUM(o.total) as total_ventas,
    AVG(o.total) as ticket_promedio
FROM ordenes o
WHERE o.estado IN ('pagado', 'preparacion', 'enviado', 'entregado')
GROUP BY DATE(o.fecha_creacion)
ORDER BY fecha DESC;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW vista_productos_mas_vendidos AS
SELECT 
    oi.producto_id,
    oi.producto_nombre,
    SUM(oi.cantidad) as total_vendido,
    SUM(oi.subtotal) as ingresos_total
FROM orden_items oi
JOIN ordenes o ON oi.orden_id = o.id
WHERE o.estado IN ('pagado', 'preparacion', 'enviado', 'entregado')
GROUP BY oi.producto_id, oi.producto_nombre
ORDER BY total_vendido DESC;

-- Vista de cursos más populares
CREATE OR REPLACE VIEW vista_cursos_populares AS
SELECT 
    c.id,
    c.titulo,
    COUNT(uc.id) as total_alumnos,
    SUM(c.precio) as ingresos_total
FROM cursos c
LEFT JOIN usuarios_cursos uc ON c.id = uc.curso_id
GROUP BY c.id, c.titulo
ORDER BY total_alumnos DESC;

-- ===================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ===================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_cursos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo pueden ver su propia información)
CREATE POLICY usuarios_select_own ON usuarios
    FOR SELECT
    USING (auth.uid()::text = id::text OR rol = 'admin');

-- Políticas para ordenes (solo pueden ver sus propias ordenes)
CREATE POLICY ordenes_select_own ON ordenes
    FOR SELECT
    USING (auth.uid()::text = usuario_id::text);

-- Políticas para usuarios_cursos (solo pueden ver sus propios cursos)
CREATE POLICY usuarios_cursos_select_own ON usuarios_cursos
    FOR SELECT
    USING (auth.uid()::text = usuario_id::text);

-- ===================================
-- FUNCIONES ÚTILES
-- ===================================

-- Generar número de orden único
CREATE OR REPLACE FUNCTION generar_numero_orden()
RETURNS TEXT AS $$
DECLARE
    nuevo_numero TEXT;
    existe BOOLEAN;
BEGIN
    LOOP
        -- Formato: EA-YYYYMMDD-XXXX (ej: EA-20250127-0001)
        nuevo_numero := 'EA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                        LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        -- Verificar si existe
        SELECT EXISTS(SELECT 1 FROM ordenes WHERE numero_orden = nuevo_numero) INTO existe;
        
        -- Si no existe, retornar
        IF NOT existe THEN
            RETURN nuevo_numero;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(fecha_desde TIMESTAMP DEFAULT NOW() - INTERVAL '30 days')
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'total_ventas', (
            SELECT COALESCE(SUM(total), 0)
            FROM ordenes
            WHERE estado IN ('pagado', 'preparacion', 'enviado', 'entregado')
            AND fecha_creacion >= fecha_desde
        ),
        'total_ordenes', (
            SELECT COUNT(*)
            FROM ordenes
            WHERE estado IN ('pagado', 'preparacion', 'enviado', 'entregado')
            AND fecha_creacion >= fecha_desde
        ),
        'ordenes_pendientes', (
            SELECT COUNT(*)
            FROM ordenes
            WHERE estado = 'pendiente'
        ),
        'nuevos_clientes', (
            SELECT COUNT(*)
            FROM usuarios
            WHERE rol = 'cliente'
            AND fecha_registro >= fecha_desde
        ),
        'cursos_activos', (
            SELECT COUNT(*)
            FROM cursos
            WHERE activo = true
        ),
        'productos_activos', (
            SELECT COUNT(*)
            FROM productos
            WHERE activo = true
        )
    ) INTO resultado;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- COMENTARIOS
-- ===================================

COMMENT ON TABLE usuarios IS 'Usuarios del sistema (clientes y administradores)';
COMMENT ON TABLE productos IS 'Catálogo de productos físicos de la panadería';
COMMENT ON TABLE cursos IS 'Cursos digitales de panadería y repostería';
COMMENT ON TABLE ordenes IS 'Órdenes de compra (productos físicos)';
COMMENT ON TABLE orden_items IS 'Items individuales de cada orden';
COMMENT ON TABLE pagos IS 'Registro de transacciones y pagos';
COMMENT ON TABLE usuarios_cursos IS 'Relación de cursos comprados por usuarios';
