# 🚀 Guía Rápida: Implementar Pagos Seguros

## **Paso 1: Instalar Dependencias**

```bash
npm install express-rate-limit
```

---

## **Paso 2: Configurar Variables de Entorno**

1. Crear archivo `.env` (copiar desde `.env.example`)
2. Obtener credenciales de Mercado Pago:
   - Ir a: https://www.mercadopago.com.ar/developers/panel/credentials
   - Copiar **Access Token** (producción)
   - Copiar **Public Key** (producción)

```env
# .env
MP_ACCESS_TOKEN=APP_USR-tu-access-token-aqui
MP_PUBLIC_KEY=APP_USR-tu-public-key-aqui
WEBHOOK_BASE_URL=https://tu-dominio.com
CLIENT_URL=https://tu-dominio.com
```

---

## **Paso 3: Aplicar Rate Limiting**

```javascript
// src/routes/pagos.routes.js
import { pagoLimiter, webhookLimiter } from '../middleware/rateLimiter.js';

// Aplicar rate limiter a crear preferencia
router.post('/preferencia', pagoLimiter, crearPreferencia);

// Aplicar rate limiter a webhook
router.post('/webhook', webhookLimiter, procesarWebhook);
```

---

## **Paso 4: Configurar Webhook en Mercado Pago**

1. Ir a: https://www.mercadopago.com.ar/developers/panel/webhooks
2. Crear nuevo webhook
3. **URL:** `https://tu-dominio.com/api/pagos/webhook`
4. **Eventos:** Seleccionar `payment` ✅
5. Guardar

---

## **Paso 5: Probar Pagos (Sandbox)**

### **Credenciales de Prueba:**

1. Ir a: https://www.mercadopago.com.ar/developers/panel/test-accounts
2. Crear usuario de prueba (comprador)
3. Usar tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-cards

### **Tarjetas de Prueba Comunes:**

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | 4509 9535 6623 3704 | 123 | 11/25 | ✅ Aprobado |
| Mastercard | 5031 7557 3453 0604 | 123 | 11/25 | ✅ Aprobado |
| Visa | 4000 0000 0000 0010 | 123 | 11/25 | ❌ Rechazado |

---

## **Paso 6: Verificar Flujo Completo**

### **Flujo del Cliente:**

1. Cliente agrega productos al carrito
2. Completa formulario de checkout
3. Click en "Confirmar Pedido"
4. Backend crea preferencia de MP
5. Cliente redirigido a Checkout de Mercado Pago
6. Completa pago
7. Mercado Pago redirige a página de éxito
8. Webhook actualiza estado de orden en tu BD

### **Verificar en Logs:**

```bash
# Ver logs del servidor
node server.js

# Deberías ver:
✅ Orden #123 creada
✅ Preferencia MP creada: 123-abc-def
✅ Webhook recibido: payment
✅ Pago aprobado para orden #123
✅ Email enviado
```

---

## **Paso 7: Monitorear Pagos**

### **Dashboard de Administrador:**

```javascript
// GET /api/admin/pagos/dashboard
{
  "total_ordenes": 150,
  "pagos_aprobados": 120,
  "pagos_pendientes": 25,
  "pagos_rechazados": 5,
  "ingresos_total": 450000
}
```

### **Ver Estado de Órdenes:**

```sql
-- En Supabase SQL Editor
SELECT 
  numero_orden,
  cliente_nombre,
  total,
  estado,
  mercadopago_status,
  created_at
FROM ordenes
ORDER BY created_at DESC
LIMIT 50;
```

---

## **Paso 8: Pasar a Producción**

### **Checklist:**

- [ ] Cambiar `NODE_ENV` a `production` en `.env`
- [ ] Usar credenciales de producción (NO test)
- [ ] Configurar dominio real en `WEBHOOK_BASE_URL`
- [ ] Configurar dominio real en `CLIENT_URL`
- [ ] Habilitar HTTPS/SSL en servidor
- [ ] Configurar webhook en panel de MP (producción)
- [ ] Probar pago real con tarjeta personal
- [ ] Verificar que webhook actualiza BD
- [ ] Verificar que emails/WhatsApp se envían

---

## **Solución de Problemas Comunes**

### **🔴 Webhook no se recibe:**

```bash
# Verificar que URL sea pública
curl https://tu-dominio.com/api/pagos/webhook

# Ver logs de Mercado Pago
# Panel → Webhooks → Ver logs de notificaciones
```

### **🔴 Pago aprobado pero orden no actualiza:**

```javascript
// Verificar logs del webhook
console.log('Webhook recibido:', req.body);

// Verificar que external_reference coincida con orden_id
SELECT * FROM ordenes WHERE id = external_reference;
```

### **🔴 Error "Access token inválido":**

```bash
# Verificar que sea token de PRODUCCIÓN (no test)
# Debe empezar con: APP_USR-

# Regenerar token si es necesario
# Panel MP → Credenciales → Generar nuevas
```

---

## **Recursos Adicionales**

- **Documentación completa:** [SEGURIDAD_MERCADOPAGO.md](./SEGURIDAD_MERCADOPAGO.md)
- **Panel de Mercado Pago:** https://www.mercadopago.com.ar/developers/panel
- **Soporte MP:** soporte@mercadopago.com.ar
- **Status de API:** https://status.mercadopago.com/

---

## **Contacto y Soporte**

Si encuentras problemas:

1. Revisar logs del servidor
2. Revisar logs de webhooks en panel de MP
3. Verificar estado de orden en Supabase
4. Contactar soporte de Mercado Pago

**¡Tu sistema de pagos está listo y seguro! 🎉**
