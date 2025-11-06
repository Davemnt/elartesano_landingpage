# 🔐 Guía: Protección de Credenciales

## **❌ NUNCA Hacer Esto:**

```javascript
// ❌ MALO - Frontend (index.html, cursos.html, etc.)
<script>
  const accessToken = "APP_USR-1234567890-abcdef"; // ¡EXPUESTO!
  
  fetch('https://api.mercadopago.com/v1/preferences', {
    headers: {
      'Authorization': `Bearer ${accessToken}` // ¡Todos pueden verlo!
    }
  });
</script>
```

**Problema:** Cualquiera puede abrir DevTools (F12) y ver tu token.

---

## **✅ Hacer Esto:**

### **Paso 1: Variables de Entorno (.env)**

```env
# .env - NUNCA subir a GitHub
MP_ACCESS_TOKEN=APP_USR-tu-token-real-aqui
MP_PUBLIC_KEY=APP_USR-tu-public-key-aqui
```

### **Paso 2: .gitignore**

```gitignore
# .gitignore
.env
.env.local
.env.production
node_modules/
```

### **Paso 3: Backend (Node.js)**

```javascript
// src/config/mercadopago.js
import { MercadoPagoConfig } from 'mercadopago';

// ✅ Token SOLO en backend
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // Seguro
  options: {
    timeout: 5000
  }
});

export default client;
```

### **Paso 4: Frontend (Solo Public Key si es necesario)**

```javascript
// index.html - Solo si usas Checkout Bricks
<script>
  const mp = new MercadoPago('TU_PUBLIC_KEY'); // OK - es pública
  // NUNCA uses Access Token aquí
</script>
```

### **Paso 5: Arquitectura Correcta**

```
Frontend (index.html)
    ↓ Fetch
Backend (Node.js) ← Access Token aquí
    ↓ API Call
Mercado Pago
```

**Código Frontend:**
```javascript
// index.html
async function finalizarCompra() {
  // Cliente solo envía datos básicos
  const response = await fetch('/api/pagos/crear-preferencia', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orden_id: 123,
      payer: {
        email: 'cliente@email.com',
        name: 'Juan Pérez'
      }
    })
  });
  
  const data = await response.json();
  // Redirigir a Mercado Pago
  window.location.href = data.init_point;
}
```

**Código Backend:**
```javascript
// src/controllers/pagos.controller.js
import { preference } from '../config/mercadopago.js';

export const crearPreferencia = async (req, res) => {
  // ✅ Access Token usado SOLO aquí (backend)
  const result = await preference.create({
    body: {
      items: [/* ... */],
      payer: req.body.payer
    }
  });
  
  res.json({ init_point: result.init_point });
};
```

---

## **Verificar que está Seguro:**

### **Test 1: Buscar en código fuente**
```bash
# En tu carpeta del proyecto
grep -r "APP_USR" *.html *.js

# Si aparece algo: ¡PELIGRO!
# No debe aparecer nada en archivos públicos
```

### **Test 2: DevTools**
1. Abrir tu sitio web
2. F12 → Sources
3. Buscar "APP_USR" o "access"
4. **NO debe aparecer tu Access Token**

### **Test 3: Ver código fuente**
1. Click derecho → Ver código fuente
2. Ctrl+F → Buscar "APP_USR"
3. **NO debe aparecer**

---

## **Checklist de Seguridad:**

- [ ] Access Token en `.env`
- [ ] `.env` en `.gitignore`
- [ ] Token NO aparece en frontend
- [ ] Token NO en repositorio GitHub
- [ ] Solo Public Key en frontend (si es necesario)
- [ ] Todas las llamadas a MP desde backend

**Si todo está ✅, tus credenciales están seguras.**
