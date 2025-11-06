import express from 'express';
import rateLimit from 'express-rate-limit';
import { crearPreferencia, webhook } from '../controllers/pagos.controller.js';
const router = express.Router();

// Rate limiter para crear preferencias de pago
// Límite: 5 intentos por 15 minutos por IP
const crearPreferenciaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requests máximo
  message: {
    success: false,
    message: 'Demasiados intentos de pago. Por favor espera 15 minutos e intenta nuevamente.'
  },
  standardHeaders: true, // Retorna info del rate limit en `RateLimit-*` headers
  legacyHeaders: false, // Deshabilita `X-RateLimit-*` headers
});

// Rate limiter para webhooks (más permisivo)
// Límite: 100 requests por 15 minutos
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests máximo
  message: {
    success: false,
    message: 'Demasiados webhooks recibidos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Crear preferencia de Mercado Pago para una orden existente
router.post('/preferencia', crearPreferenciaLimiter, crearPreferencia);

// Webhook para notificaciones de Mercado Pago
router.post('/webhook', webhookLimiter, express.raw({ type: '*/*' }), webhook);

export default router;
