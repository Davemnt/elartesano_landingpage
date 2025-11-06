-- Tabla para logs de seguridad
-- Registra eventos sospechosos para auditoría

CREATE TABLE IF NOT EXISTS security_logs (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    ip_address VARCHAR(50),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_security_logs_event_type ON security_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_security_logs_severity ON security_logs(severity);
CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON security_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_ip ON security_logs(ip_address);

-- Índice GIN para búsquedas en el campo JSONB details
CREATE INDEX IF NOT EXISTS idx_security_logs_details ON security_logs USING GIN (details);

-- Comentarios
COMMENT ON TABLE security_logs IS 'Registro de eventos de seguridad para auditoría';
COMMENT ON COLUMN security_logs.event_type IS 'Tipo de evento: price_manipulation, duplicate_payment, rate_limit_exceeded, invalid_webhook, etc.';
COMMENT ON COLUMN security_logs.severity IS 'Nivel de severidad: low, medium, high, critical';
COMMENT ON COLUMN security_logs.details IS 'Detalles adicionales del evento en formato JSON';

-- Row Level Security (RLS)
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Política: Solo admins pueden leer logs de seguridad
CREATE POLICY "Admins pueden ver logs de seguridad"
    ON security_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM usuarios
            WHERE usuarios.id = auth.uid()
            AND usuarios.role = 'admin'
        )
    );

-- Permitir inserción de logs desde el backend (sin autenticación)
CREATE POLICY "Sistema puede crear logs de seguridad"
    ON security_logs
    FOR INSERT
    WITH CHECK (true);

-- Vista para resumen de eventos por día
CREATE OR REPLACE VIEW security_events_daily AS
SELECT 
    DATE(created_at) as date,
    event_type,
    severity,
    COUNT(*) as count
FROM security_logs
GROUP BY DATE(created_at), event_type, severity
ORDER BY date DESC, count DESC;

-- Vista para eventos críticos recientes
CREATE OR REPLACE VIEW critical_security_events AS
SELECT 
    id,
    event_type,
    severity,
    ip_address,
    details,
    created_at
FROM security_logs
WHERE severity IN ('high', 'critical')
ORDER BY created_at DESC
LIMIT 100;

-- Función para limpiar logs antiguos (mantener últimos 90 días)
CREATE OR REPLACE FUNCTION cleanup_old_security_logs()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM security_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- Comentario en la función
COMMENT ON FUNCTION cleanup_old_security_logs() IS 'Elimina logs de seguridad con más de 90 días de antigüedad';
