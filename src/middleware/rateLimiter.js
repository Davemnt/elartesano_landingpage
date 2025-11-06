// src/middleware/rateLimiter.js
// Middleware para limitar intentos de pago y prevenir abuso

import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter para creación de preferencias de pago
 * Limita a 5 intentos cada 15 minutos por IP
 */
export const pagoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos
    message: {
        success: false,
        message: 'Demasiados intentos de pago. Por favor, espera 15 minutos e intenta nuevamente.',
        retryAfter: '15 minutos'
    },
    standardHeaders: true, // Retornar info de rate limit en headers `RateLimit-*`
    legacyHeaders: false, // Deshabilitar headers `X-RateLimit-*`
    
    // Personalizar mensaje según intentos restantes
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de pago',
            error: 'Has excedido el límite de intentos de pago. Por seguridad, debes esperar 15 minutos antes de intentar nuevamente.',
            retryAfter: req.rateLimit.resetTime
        });
    },
    
    // Skipear rate limit para requests exitosos previos
    skip: (req) => {
        // Puedes agregar lógica aquí para skipear usuarios autenticados, etc.
        return false;
    }
});

/**
 * Rate Limiter para webhooks de Mercado Pago
 * Más permisivo ya que son notificaciones del servidor de MP
 */
export const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 50, // 50 requests por minuto (MP puede enviar múltiples)
    message: {
        success: false,
        message: 'Demasiadas notificaciones de webhook'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate Limiter general para API
 * Para endpoints normales
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por 15 minutos
    message: {
        success: false,
        message: 'Demasiadas peticiones. Por favor, intenta más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Rate Limiter estricto para endpoints sensibles (admin)
 */
export const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 requests por 15 minutos
    message: {
        success: false,
        message: 'Demasiadas peticiones al panel de administración'
    },
    standardHeaders: true,
    legacyHeaders: false
});

export default {
    pagoLimiter,
    webhookLimiter,
    apiLimiter,
    adminLimiter
};
