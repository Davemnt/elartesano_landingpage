import express from 'express';
import { crearPreferencia, webhook } from '../controllers/pagos.controller.js';
const router = express.Router();

// Crear preferencia de Mercado Pago para una orden existente
router.post('/preferencia', crearPreferencia);

// Webhook para notificaciones de Mercado Pago
router.post('/webhook', express.raw({ type: '*/*' }), webhook);

export default router;
