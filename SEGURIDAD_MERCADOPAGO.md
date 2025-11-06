# 🔒 Guía Completa de Seguridad - Mercado Pago

## **Índice**
1. [Configuración Segura](#configuración-segura)
2. [Flujo de Pago Seguro](#flujo-de-pago-seguro)
3. [Webhooks y Verificación](#webhooks-y-verificación)
4. [Prevención de Fraudes](#prevención-de-fraudes)
5. [Certificación PCI DSS](#certificación-pci-dss)
6. [Checklist de Producción](#checklist-de-producción)

---

## **1. Configuración Segura**

### **✅ Credenciales - Dónde Obtenerlas**

1. Ir a: https://www.mercadopago.com.ar/developers/panel/credentials
2. Crear aplicación para tu negocio
3. Obtener credenciales:
   - **Access Token** (PRIVADO - Backend)
   - **Public Key** (Público - Frontend)

### **⚠️ NUNCA Expongas:**
```javascript
❌ NO HACER:
const accessToken = "APP_USR-123456..."; // En frontend
const publicKey = "APP_USR_PUBLIC..."; // OK en frontend
```

### **✅ Configuración Correcta:**

```javascript
// src/config/mercadopago.js
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Inicializar cliente con Access Token PRIVADO
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // ⚠️ SOLO en backend
  options: {
    timeout: 5000,
    idempotencyKey: 'unique-key-per-request' // Previene pagos duplicados
  }
});

const preference = new Preference(client);
const payment = new Payment(client);

module.exports = { preference, payment };
```

---

## **2. Flujo de Pago Seguro**

### **Arquitectura Recomendada:**

```
┌─────────────┐      ┌──────────────┐      ┌───────────────┐
│   Cliente   │─────▶│  Tu Backend  │─────▶│ Mercado Pago  │
│  (Browser)  │      │   (Node.js)  │      │      API      │
└─────────────┘      └──────────────┘      └───────────────┘
       │                     │                      │
       │                     │                      │
       │◀────Redirect────────┴──────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Mercado Pago Checkout (Seguro)         │
│  - Datos de tarjeta nunca en tu server  │
│  - Certificado SSL de MP                │
│  - Cumple PCI DSS                       │
└─────────────────────────────────────────┘
```

### **Implementación Paso a Paso:**

#### **Backend - Crear Preferencia de Pago:**

```javascript
// src/controllers/pagos.controller.js
const { preference } = require('../config/mercadopago');
const { supabase } = require('../config/supabase');

async function crearPreferencia(req, res) {
  try {
    const { orden_id, items, cliente_email, cliente_nombre } = req.body;

    // 1. Validar orden en tu base de datos
    const { data: orden, error } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', orden_id)
      .single();

    if (error || !orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    // 2. Verificar que no esté pagada
    if (orden.estado === 'pagado') {
      return res.status(400).json({ error: 'Orden ya pagada' });
    }

    // 3. Crear preferencia de pago con DATOS VALIDADOS
    const body = {
      items: items.map(item => ({
        id: String(item.producto_id),
        title: item.producto_nombre,
        quantity: Number(item.cantidad),
        unit_price: Number(item.precio_unitario),
        currency_id: 'ARS'
      })),
      
      // Información del comprador
      payer: {
        name: cliente_nombre,
        email: cliente_email,
        phone: {
          area_code: '',
          number: orden.cliente_telefono || ''
        },
        address: {
          street_name: orden.direccion_entrega || '',
          zip_code: orden.codigo_postal || ''
        }
      },

      // URLs de retorno
      back_urls: {
        success: `${process.env.CLIENT_URL}/pago-exitoso.html?orden=${orden_id}`,
        failure: `${process.env.CLIENT_URL}/pago-fallido.html?orden=${orden_id}`,
        pending: `${process.env.CLIENT_URL}/pago-pendiente.html?orden=${orden_id}`
      },
      
      auto_return: 'approved', // Redirigir automáticamente si se aprueba

      // Configuración de notificaciones (CRÍTICO)
      notification_url: `${process.env.WEBHOOK_BASE_URL}/api/webhooks/mercadopago`,

      // Metadata para tracking interno
      external_reference: orden_id.toString(),
      metadata: {
        orden_id: orden_id,
        cliente_email: cliente_email,
        timestamp: new Date().toISOString()
      },

      // Métodos de pago permitidos
      payment_methods: {
        excluded_payment_types: [], // Permitir todos
        installments: 12 // Cuotas máximas
      },

      // Configuración adicional
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      
      // IMPORTANTE: Prevenir pagos binarios (duplicados)
      binary_mode: false, // false = permite estados pendientes
      
      statement_descriptor: 'El Artesano' // Nombre en resumen de tarjeta
    };

    // 4. Crear preferencia en Mercado Pago
    const result = await preference.create({ body });

    // 5. Guardar preference_id en la orden
    await supabase
      .from('ordenes')
      .update({ 
        mercadopago_preference_id: result.id,
        estado: 'pendiente_pago'
      })
      .eq('id', orden_id);

    // 6. Retornar datos al frontend
    res.json({
      success: true,
      data: {
        preference_id: result.id,
        init_point: result.init_point, // URL de checkout
        sandbox_init_point: result.sandbox_init_point // URL de pruebas
      }
    });

  } catch (error) {
    console.error('Error creando preferencia MP:', error);
    res.status(500).json({ 
      error: 'Error procesando el pago',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = { crearPreferencia };
```

---

## **3. Webhooks y Verificación (CRÍTICO)**

### **¿Por qué son importantes los Webhooks?**

- ✅ Notificación instantánea de pagos aprobados
- ✅ No dependen de que el usuario vuelva a tu sitio
- ✅ Previenen fraudes
- ✅ Actualizan el estado real del pago

### **Implementación Segura de Webhooks:**

```javascript
// src/controllers/webhooks.controller.js
const { Payment } = require('mercadopago');
const { supabase } = require('../config/supabase');
const crypto = require('crypto');

async function procesarWebhookMP(req, res) {
  try {
    // 1. Responder rápido a Mercado Pago (evitar timeouts)
    res.status(200).send('OK');

    // 2. Extraer datos del webhook
    const { type, data } = req.body;

    console.log('Webhook recibido:', { type, data });

    // 3. Solo procesar notificaciones de pago
    if (type !== 'payment') {
      console.log('Tipo de notificación ignorada:', type);
      return;
    }

    // 4. Obtener ID del pago
    const paymentId = data.id;

    // 5. Consultar detalles del pago directamente a Mercado Pago (no confiar en webhook)
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: paymentId });

    console.log('Datos del pago:', paymentData);

    // 6. Extraer información relevante
    const {
      status,
      status_detail,
      external_reference, // orden_id
      transaction_amount,
      date_approved,
      payment_method_id,
      payer
    } = paymentData;

    // 7. Actualizar orden en base de datos
    const orden_id = parseInt(external_reference);

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

    // 8. Actualizar en Supabase
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

    // 9. Si el pago fue aprobado, ejecutar acciones
    if (status === 'approved') {
      // ✅ Enviar email de confirmación
      // ✅ Enviar WhatsApp al cliente
      // ✅ Notificar al admin
      // ✅ Generar acceso a curso (si aplica)
      
      console.log(`✅ Pago aprobado para orden #${orden_id}`);
    }

  } catch (error) {
    console.error('Error procesando webhook:', error);
  }
}

module.exports = { procesarWebhookMP };
```

### **Validar Firma del Webhook (Máxima Seguridad):**

```javascript
// Verificar que el webhook viene realmente de Mercado Pago
function verificarFirmaWebhook(req) {
  const xSignature = req.headers['x-signature'];
  const xRequestId = req.headers['x-request-id'];
  
  if (!xSignature || !xRequestId) {
    throw new Error('Headers de firma faltantes');
  }

  const secret = process.env.MP_WEBHOOK_SECRET; // Obtener desde MP
  const dataToHash = `${xRequestId}${req.body}`;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(dataToHash)
    .digest('hex');

  if (hash !== xSignature) {
    throw new Error('Firma inválida - Webhook falso');
  }

  return true;
}
```

---

## **4. Prevención de Fraudes**

### **Medidas de Seguridad Implementadas:**

#### **A. Idempotencia (Evitar pagos duplicados)**

```javascript
// Usar idempotency key único por orden
const idempotencyKey = `orden-${orden_id}-${Date.now()}`;

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: {
    idempotencyKey: idempotencyKey
  }
});
```

#### **B. Validación de Montos**

```javascript
// SIEMPRE calcular el total en el backend, NUNCA confiar en el frontend
function calcularTotalOrden(items, costoEnvio) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.precio_unitario * item.cantidad);
  }, 0);
  
  return subtotal + costoEnvio;
}

// Comparar con lo que envía el frontend
const totalCalculado = calcularTotalOrden(orden.items, orden.costo_envio);
const totalRecibido = req.body.total;

if (Math.abs(totalCalculado - totalRecibido) > 0.01) {
  throw new Error('Manipulación de precio detectada');
}
```

#### **C. Rate Limiting (Prevenir abuso)**

```javascript
// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const pagoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de pago
  message: 'Demasiados intentos de pago. Intenta en 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar en ruta de crear preferencia
router.post('/crear-preferencia', pagoLimiter, crearPreferencia);
```

#### **D. Verificar Estado de Orden**

```javascript
// No permitir pagar órdenes ya pagadas
if (orden.estado === 'pagado') {
  return res.status(400).json({ 
    error: 'Esta orden ya fue pagada',
    orden_id: orden.numero_orden
  });
}

// No permitir pagar órdenes canceladas
if (orden.estado === 'cancelado') {
  return res.status(400).json({ 
    error: 'Esta orden está cancelada',
    orden_id: orden.numero_orden
  });
}
```

---

## **5. Certificación PCI DSS**

### **¿Qué es PCI DSS?**
Payment Card Industry Data Security Standard - Estándar de seguridad para transacciones con tarjetas.

### **✅ Cómo Cumplir (tu caso):**

1. **NO guardes datos de tarjetas** ✅
   - Mercado Pago maneja todo
   - Tu backend nunca ve números de tarjeta

2. **Usa HTTPS** ✅
   ```nginx
   # Certificado SSL gratuito con Let's Encrypt
   server {
       listen 443 ssl;
       ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
   }
   ```

3. **Valida en backend** ✅
   - Nunca confíes en datos del frontend
   - Recalcula totales
   - Verifica estados

4. **Logs seguros** ✅
   ```javascript
   // NO registrar datos sensibles
   console.log('Pago procesado:', {
     orden_id: orden.id,
     monto: orden.total,
     // ❌ NO: numero_tarjeta, cvv, etc.
   });
   ```

---

## **6. Checklist de Producción**

### **Antes de Lanzar:**

- [ ] **Credenciales de Producción**
  - [ ] Access Token de producción configurado
  - [ ] Public Key de producción en frontend
  - [ ] Webhook Secret configurado

- [ ] **Variables de Entorno**
  - [ ] `.env` con valores reales (NO subir a GitHub)
  - [ ] `.gitignore` incluye `.env`
  - [ ] `NODE_ENV=production`

- [ ] **URLs Configuradas**
  - [ ] `CLIENT_URL` apunta a dominio real
  - [ ] `WEBHOOK_BASE_URL` apunta a servidor público
  - [ ] Certificado SSL válido

- [ ] **Webhooks**
  - [ ] URL de webhook configurada en panel de Mercado Pago
  - [ ] Endpoint `/api/webhooks/mercadopago` funciona
  - [ ] Verificación de firma implementada

- [ ] **Seguridad**
  - [ ] Rate limiting configurado
  - [ ] Validación de montos implementada
  - [ ] Estados de orden verificados
  - [ ] Logs sin datos sensibles

- [ ] **Pruebas**
  - [ ] Pago aprobado funciona
  - [ ] Pago rechazado funciona
  - [ ] Pago pendiente funciona
  - [ ] Webhook actualiza correctamente
  - [ ] Email/WhatsApp se envían

- [ ] **Base de Datos**
  - [ ] Tabla `ordenes` con campos necesarios
  - [ ] Índices en campos de búsqueda
  - [ ] Backups configurados

### **Configurar Webhook en Mercado Pago:**

1. Ir a: https://www.mercadopago.com.ar/developers/panel/webhooks
2. Crear nuevo webhook
3. URL: `https://tu-dominio.com/api/webhooks/mercadopago`
4. Eventos: `payment` ✅
5. Guardar y probar

---

## **7. Monitoreo y Alertas**

### **Dashboard de Pagos:**

```javascript
// src/routes/admin.routes.js
router.get('/admin/pagos/dashboard', async (req, res) => {
  const { data } = await supabase
    .from('ordenes')
    .select('*')
    .order('created_at', { ascending: false });

  const stats = {
    total_ordenes: data.length,
    pagos_aprobados: data.filter(o => o.estado === 'pagado').length,
    pagos_pendientes: data.filter(o => o.estado === 'pendiente_pago').length,
    pagos_rechazados: data.filter(o => o.estado === 'cancelado').length,
    ingresos_total: data
      .filter(o => o.estado === 'pagado')
      .reduce((sum, o) => sum + o.total, 0)
  };

  res.json({ success: true, data: stats });
});
```

---

## **8. Soporte y Recursos**

- **Documentación Oficial:** https://www.mercadopago.com.ar/developers/es/docs
- **Panel de Desarrollador:** https://www.mercadopago.com.ar/developers/panel
- **Soporte:** soporte@mercadopago.com.ar
- **Status de API:** https://status.mercadopago.com/

---

## **Resumen de Seguridad**

| Aspecto | Implementado | Prioridad |
|---------|--------------|-----------|
| Access Token en backend | ✅ | 🔴 CRÍTICO |
| Webhooks configurados | ✅ | 🔴 CRÍTICO |
| HTTPS/SSL | ✅ | 🔴 CRÍTICO |
| Validación de montos | ✅ | 🔴 CRÍTICO |
| Rate limiting | ✅ | 🟡 ALTO |
| Verificación de firma | ⚠️ | 🟡 ALTO |
| Logs sin datos sensibles | ✅ | 🟢 MEDIO |
| Monitoreo activo | ⚠️ | 🟢 MEDIO |

---

**¿Preguntas? Consulta la documentación o contacta soporte de Mercado Pago.**
