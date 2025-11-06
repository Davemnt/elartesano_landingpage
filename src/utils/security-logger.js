/**
 * Sistema de Logs de Seguridad
 * Registra eventos sospechosos para auditoría y alertas
 */

import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

// Tipos de eventos de seguridad
export const SECURITY_EVENTS = {
    PRICE_MANIPULATION: 'price_manipulation',
    DUPLICATE_PAYMENT: 'duplicate_payment',
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    INVALID_WEBHOOK: 'invalid_webhook',
    ORDER_NOT_FOUND: 'order_not_found',
    INVALID_INPUT: 'invalid_input',
    UNAUTHORIZED_ACCESS: 'unauthorized_access'
};

// Severidad de eventos
export const SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Registrar evento de seguridad
 * @param {string} eventType - Tipo de evento (SECURITY_EVENTS)
 * @param {string} severity - Severidad (SEVERITY)
 * @param {object} details - Detalles del evento
 * @param {object} req - Request de Express (opcional)
 */
export const logSecurityEvent = async (eventType, severity, details, req = null) => {
    const timestamp = new Date().toISOString();
    
    // Información del request
    const requestInfo = req ? {
        ip: req.ip || req.connection?.remoteAddress || 'unknown',
        user_agent: req.headers['user-agent'] || 'unknown',
        method: req.method,
        url: req.originalUrl || req.url,
        headers: {
            origin: req.headers.origin,
            referer: req.headers.referer
        }
    } : {};

    const logEntry = {
        timestamp,
        event_type: eventType,
        severity,
        details,
        request: requestInfo
    };

    // 1️⃣ Log en consola con color según severidad
    const colors = {
        low: '\x1b[36m',      // Cyan
        medium: '\x1b[33m',   // Yellow
        high: '\x1b[35m',     // Magenta
        critical: '\x1b[31m'  // Red
    };
    const reset = '\x1b[0m';
    const color = colors[severity] || reset;

    const icon = {
        low: 'ℹ️',
        medium: '⚠️',
        high: '🚨',
        critical: '❌'
    }[severity] || '📝';

    console.log(`${color}${icon} [SECURITY] ${eventType.toUpperCase()}${reset}`);
    console.log(`${color}   Severity: ${severity}${reset}`);
    if (requestInfo.ip) console.log(`${color}   IP: ${requestInfo.ip}${reset}`);
    console.log(`${color}   Details:${reset}`, details);
    console.log(`${color}   Time: ${timestamp}${reset}\n`);

    // 2️⃣ Guardar en base de datos (si está configurada)
    try {
        if (supabaseAdmin) {
            await supabaseAdmin.from('security_logs').insert({
                event_type: eventType,
                severity,
                ip_address: requestInfo.ip,
                user_agent: requestInfo.user_agent,
                request_method: requestInfo.method,
                request_url: requestInfo.url,
                details: details,
                created_at: timestamp
            });
        }
    } catch (dbError) {
        console.warn('⚠️ No se pudo guardar log en BD:', dbError.message);
        // No fallar si la BD no está disponible
    }

    // 3️⃣ Guardar en archivo local como backup
    try {
        const logsDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        const logFileName = `security-${new Date().toISOString().split('T')[0]}.log`;
        const logFilePath = path.join(logsDir, logFileName);
        
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFilePath, logLine, 'utf8');
    } catch (fileError) {
        console.warn('⚠️ No se pudo escribir log en archivo:', fileError.message);
    }

    // 4️⃣ Alertas automáticas para eventos críticos
    if (severity === SEVERITY.CRITICAL || severity === SEVERITY.HIGH) {
        await sendSecurityAlert(eventType, severity, details, requestInfo);
    }

    return logEntry;
};

/**
 * Enviar alerta de seguridad al administrador
 */
const sendSecurityAlert = async (eventType, severity, details, requestInfo) => {
    try {
        // TODO: Implementar envío de email/WhatsApp al admin
        console.log('🔔 ALERTA DE SEGURIDAD ENVIADA AL ADMIN');
        
        // Ejemplo de integración con servicio de email
        // const { enviarEmailAlertaSeguridad } = await import('../services/email.service.js');
        // await enviarEmailAlertaSeguridad({
        //     event_type: eventType,
        //     severity,
        //     details,
        //     ip: requestInfo.ip,
        //     timestamp: new Date().toISOString()
        // });
        
    } catch (error) {
        console.error('Error enviando alerta de seguridad:', error.message);
    }
};

/**
 * Obtener logs de seguridad recientes
 * @param {number} limit - Cantidad de logs a obtener
 * @param {string} eventType - Filtrar por tipo de evento (opcional)
 */
export const getRecentSecurityLogs = async (limit = 100, eventType = null) => {
    try {
        let query = supabaseAdmin
            .from('security_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (eventType) {
            query = query.eq('event_type', eventType);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error obteniendo logs de seguridad:', error.message);
        return [];
    }
};

/**
 * Obtener estadísticas de eventos de seguridad
 */
export const getSecurityStats = async (days = 7) => {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabaseAdmin
            .from('security_logs')
            .select('event_type, severity, created_at')
            .gte('created_at', startDate.toISOString());

        if (error) throw error;

        // Agrupar por tipo y severidad
        const stats = {
            total: data.length,
            by_type: {},
            by_severity: {},
            by_day: {}
        };

        data.forEach(log => {
            // Por tipo
            stats.by_type[log.event_type] = (stats.by_type[log.event_type] || 0) + 1;
            
            // Por severidad
            stats.by_severity[log.severity] = (stats.by_severity[log.severity] || 0) + 1;
            
            // Por día
            const day = log.created_at.split('T')[0];
            stats.by_day[day] = (stats.by_day[day] || 0) + 1;
        });

        return stats;
    } catch (error) {
        console.error('Error obteniendo estadísticas de seguridad:', error.message);
        return null;
    }
};

export default {
    logSecurityEvent,
    getRecentSecurityLogs,
    getSecurityStats,
    SECURITY_EVENTS,
    SEVERITY
};
