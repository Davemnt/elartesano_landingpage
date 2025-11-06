# 🚨 Guía: Prevención de Fraudes

## **A. Rate Limiting (Limitar Intentos)**

### **Implementación:**

```javascript
// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Para pagos - muy restrictivo
export const pagoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos
  message: {
    success: false,
    error: 'Demasiados intentos de pago. Espera 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Personalizar respuesta
  handler: (req, res) => {
    const resetTime = new Date(req.rateLimit.resetTime);
    res.status(429).json({
      success: false,
      error: 'Límite de intentos excedido',
      message: `Has realizado demasiados intentos. Podrás intentar nuevamente a las ${resetTime.toLocaleTimeString()}.`,
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
    });
  }
});

// Para API general - más permisivo
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones' }
});

export default { pagoLimiter, apiLimiter };
```

### **Aplicar en Rutas:**

```javascript
// src/routes/pagos.routes.js
import express from 'express';
import { pagoLimiter } from '../middleware/rateLimiter.js';
import { crearPreferencia, procesarWebhook } from '../controllers/pagos.controller.js';

const router = express.Router();

// ✅ Rate limiter aplicado ANTES del controller
router.post('/crear-preferencia', pagoLimiter, crearPreferencia);

export default router;
```

### **Instalar Dependencia:**

```bash
npm install express-rate-limit
```

---

## **B. Validar Estado de Orden (Evitar Doble Pago)**

```javascript
// src/controllers/pagos.controller.js
export const crearPreferencia = async (req, res) => {
  const { orden_id } = req.body;
  
  // 1️⃣ OBTENER ORDEN
  const { data: orden } = await supabase
    .from('ordenes')
    .select('*')
    .eq('id', orden_id)
    .single();
  
  if (!orden) {
    return res.status(404).json({ 
      error: 'Orden no encontrada' 
    });
  }
  
  // 2️⃣ VALIDAR ESTADO: No permitir órdenes ya pagadas
  if (orden.estado === 'pagado') {
    return res.status(400).json({ 
      success: false,
      error: 'Esta orden ya fue pagada',
      mensaje: `Tu pedido #${orden.numero_orden} ya fue pagado exitosamente.`,
      numero_orden: orden.numero_orden,
      fecha_pago: orden.fecha_pago
    });
  }
  
  // 3️⃣ VALIDAR ESTADO: No permitir órdenes canceladas
  if (orden.estado === 'cancelado') {
    return res.status(400).json({ 
      success: false,
      error: 'Esta orden está cancelada',
      mensaje: 'Esta orden fue cancelada. Por favor, crea un nuevo pedido.'
    });
  }
  
  // 4️⃣ VERIFICAR SI YA TIENE PREFERENCIA ACTIVA
  if (orden.mercadopago_preference_id && orden.estado === 'pendiente_pago') {
    // Ya tiene una preferencia activa, retornarla
    return res.json({
      success: true,
      mensaje: 'Ya existe una preferencia de pago activa',
      data: {
        preference_id: orden.mercadopago_preference_id,
        // Nota: MP no permite obtener init_point de preferencias viejas
        // Usuario debe crear nueva orden si expiró
      }
    });
  }
  
  // 5️⃣ CONTINUAR CON CREACIÓN DE PREFERENCIA...
  // (resto del código)
};
```

---

## **C. Idempotencia (Evitar Duplicados)**

### **Método 1: Usar Idempotency Key**

```javascript
// src/config/mercadopago.js
import { MercadoPagoConfig } from 'mercadopago';

export function crearClienteMP(ordenId) {
  // Crear cliente único por orden
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
      timeout: 5000,
      // ✅ Clave única por orden
      idempotencyKey: `orden-${ordenId}-${Date.now()}`
    }
  });
}
```

### **Método 2: Usar Transacciones de BD**

```javascript
// src/controllers/pagos.controller.js
export const crearPreferencia = async (req, res) => {
  const { orden_id } = req.body;
  
  try {
    // 1️⃣ BLOQUEAR ORDEN: Con transacción
    const { data: orden, error } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', orden_id)
      .eq('estado', 'pendiente') // Solo si está pendiente
      .single();
    
    if (!orden) {
      return res.status(400).json({ 
        error: 'Orden no disponible para pago' 
      });
    }
    
    // 2️⃣ ACTUALIZAR ESTADO: A "procesando_pago"
    const { error: updateError } = await supabase
      .from('ordenes')
      .update({ 
        estado: 'procesando_pago',
        updated_at: new Date().toISOString()
      })
      .eq('id', orden_id)
      .eq('estado', 'pendiente'); // Solo si sigue pendiente
    
    if (updateError) {
      return res.status(409).json({ 
        error: 'Pago ya en proceso. Por favor, espera.'
      });
    }
    
    // 3️⃣ CREAR PREFERENCIA
    const result = await preference.create({
      body: { /* ... */ }
    });
    
    // 4️⃣ ACTUALIZAR CON PREFERENCIA
    await supabase
      .from('ordenes')
      .update({ 
        mercadopago_preference_id: result.id,
        estado: 'pendiente_pago'
      })
      .eq('id', orden_id);
    
    res.json({
      success: true,
      data: { init_point: result.init_point }
    });
    
  } catch (error) {
    // 5️⃣ ROLLBACK: Volver a estado pendiente
    await supabase
      .from('ordenes')
      .update({ estado: 'pendiente' })
      .eq('id', orden_id);
    
    res.status(500).json({ error: 'Error procesando pago' });
  }
};
```

---

## **D. Validar Webhooks (Evitar Webhooks Falsos)**

```javascript
// src/controllers/webhooks.controller.js
import { Payment } from 'mercadopago';
import crypto from 'crypto';

export const procesarWebhookMP = async (req, res) => {
  try {
    // 1️⃣ RESPONDER RÁPIDO: Evitar timeout de MP
    res.status(200).send('OK');
    
    // 2️⃣ VALIDAR FIRMA: Verificar que viene de MP
    const xSignature = req.headers['x-signature'];
    const xRequestId = req.headers['x-request-id'];
    
    if (process.env.MP_WEBHOOK_SECRET) {
      const isValid = verificarFirmaWebhook(
        req.body, 
        xSignature, 
        xRequestId
      );
      
      if (!isValid) {
        console.error('⚠️ Webhook con firma inválida - posible ataque');
        return;
      }
    }
    
    // 3️⃣ EXTRAER DATOS
    const { type, data } = req.body;
    
    if (type !== 'payment') {
      return; // Ignorar otros tipos
    }
    
    const paymentId = data.id;
    
    // 4️⃣ CONSULTAR A MERCADO PAGO: NO confiar en webhook
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });
    
    console.log('✅ Pago consultado desde MP:', {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.transaction_amount
    });
    
    // 5️⃣ VALIDAR DATOS
    const {
      status,
      status_detail,
      external_reference,
      transaction_amount,
      date_approved,
      payment_method_id
    } = paymentData;
    
    const orden_id = parseInt(external_reference);
    
    // 6️⃣ OBTENER ORDEN: Verificar que existe
    const { data: orden } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', orden_id)
      .single();
    
    if (!orden) {
      console.error('⚠️ Orden no encontrada:', orden_id);
      return;
    }
    
    // 7️⃣ VALIDAR MONTO: Que coincida con la orden
    const montoOrden = parseFloat(orden.total);
    const montoPagado = parseFloat(transaction_amount);
    
    if (Math.abs(montoOrden - montoPagado) > 0.01) {
      console.error('⚠️ Monto no coincide:', {
        orden_id,
        montoOrden,
        montoPagado,
        diferencia: Math.abs(montoOrden - montoPagado)
      });
      
      // Alerta de fraude
      await alertarAdmin(`Monto manipulado en orden #${orden_id}`);
      return;
    }
    
    // 8️⃣ ACTUALIZAR ESTADO
    let nuevoEstado;
    switch (status) {
      case 'approved':
        nuevoEstado = 'pagado';
        break;
      case 'in_process':
      case 'pending':
        nuevoEstado = 'pendiente_pago';
        break;
      case 'rejected':
      case 'cancelled':
        nuevoEstado = 'cancelado';
        break;
      default:
        nuevoEstado = 'pendiente_pago';
    }
    
    // 9️⃣ ACTUALIZAR BD: Solo si cambió el estado
    if (orden.estado !== nuevoEstado) {
      const { error } = await supabase
        .from('ordenes')
        .update({
          estado: nuevoEstado,
          mercadopago_payment_id: paymentId,
          mercadopago_status: status,
          mercadopago_status_detail: status_detail,
          fecha_pago: status === 'approved' ? date_approved : null,
          metodo_pago_detalle: payment_method_id,
          monto_pagado: transaction_amount
        })
        .eq('id', orden_id);
      
      if (error) {
        console.error('Error actualizando orden:', error);
        return;
      }
      
      console.log(`✅ Orden #${orden_id} actualizada: ${orden.estado} → ${nuevoEstado}`);
    }
    
    // 🔟 EJECUTAR ACCIONES: Si fue aprobado
    if (status === 'approved' && orden.estado !== 'pagado') {
      // Enviar notificaciones
      await enviarEmailConfirmacion(orden);
      await enviarWhatsAppCliente(orden);
      await notificarAdmin(orden);
      
      // Si es un curso, dar acceso
      if (orden.items_incluyen_cursos) {
        await otorgarAccesoCursos(orden_id);
      }
    }
    
  } catch (error) {
    console.error('Error procesando webhook:', error);
  }
};

// Función auxiliar para verificar firma
function verificarFirmaWebhook(body, signature, requestId) {
  if (!process.env.MP_WEBHOOK_SECRET) return true;
  
  const dataToHash = `${requestId}${JSON.stringify(body)}`;
  const hash = crypto
    .createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
    .update(dataToHash)
    .digest('hex');
  
  return hash === signature;
}

async function alertarAdmin(mensaje) {
  console.error('🚨 ALERTA DE SEGURIDAD:', mensaje);
  // Enviar email/SMS al admin
}
```

---

## **E. Expiración de Preferencias**

```javascript
// src/controllers/pagos.controller.js
const preferenceData = {
  items: [...],
  
  // ✅ Preferencia expira en 24 horas
  expires: true,
  expiration_date_from: new Date().toISOString(),
  expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  
  // Otras configuraciones...
};
```

---

## **F. Monitoreo y Logs**

```javascript
// src/utils/logger.js
export function logIntentoFraude(tipo, datos) {
  const log = {
    timestamp: new Date().toISOString(),
    tipo: tipo,
    datos: datos,
    ip: datos.ip,
    user_agent: datos.userAgent
  };
  
  console.error('🚨 INTENTO DE FRAUDE:', log);
  
  // Guardar en BD para análisis
  supabase.from('logs_seguridad').insert(log);
  
  // Alertar admin si es grave
  if (tipo === 'precio_manipulado' || tipo === 'webhook_falso') {
    alertarAdminUrgente(log);
  }
}

// Uso en controllers:
if (precioManipulado) {
  logIntentoFraude('precio_manipulado', {
    orden_id,
    precioReal,
    precioEnviado,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
}
```

---

## **Checklist Completo de Prevención:**

### **Rate Limiting:**
- [ ] Instalar `express-rate-limit`
- [ ] Crear middleware `rateLimiter.js`
- [ ] Aplicar a rutas de pagos (5 intentos/15min)
- [ ] Aplicar a webhooks (50 intentos/min)
- [ ] Probar que bloquea después del límite

### **Validación de Estado:**
- [ ] Verificar que orden no esté pagada
- [ ] Verificar que orden no esté cancelada
- [ ] Verificar que no tenga preferencia activa
- [ ] Usar transacciones para prevenir race conditions

### **Idempotencia:**
- [ ] Usar idempotency key único por orden
- [ ] Implementar estados transicionales (procesando_pago)
- [ ] Rollback en caso de error

### **Webhooks Seguros:**
- [ ] Responder 200 inmediatamente
- [ ] Verificar firma del webhook (si está configurado)
- [ ] Consultar pago directamente a MP (no confiar en webhook)
- [ ] Validar monto contra orden
- [ ] Actualizar solo si cambió el estado
- [ ] Logs de todos los webhooks recibidos

### **Monitoreo:**
- [ ] Logs de intentos de manipulación
- [ ] Alertas automáticas al admin
- [ ] Tabla de logs_seguridad en BD
- [ ] Dashboard de seguridad

**Si todo está ✅, tu sistema está protegido contra fraudes.**
