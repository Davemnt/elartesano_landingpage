# 🚀 GUÍA DE IMPLEMENTACIÓN COMPLETA - EL ARTESANO E-COMMERCE

## ⚡ INICIO RÁPIDO (5 minutos)

### 1. Instalar Dependencias
```powershell
npm install
```

### 2. Configurar Variables de Entorno
Copia `.env.example` a `.env`:
```powershell
copy .env.example .env
```

Edita `.env` con tus credenciales (ver sección CONFIGURACIÓN abajo).

### 3. Configurar Supabase

#### A. Crear Proyecto en Supabase
1. Ve a https://supabase.com
2. Crea una cuenta (gratis)
3. Crea un nuevo proyecto
4. Espera 2 minutos mientras se crea

#### B. Obtener Credenciales
1. Ve a **Settings** > **API**
2. Copia:
   - Project URL → `SUPABASE_URL`
   - anon/public key → `SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_KEY`

#### C. Ejecutar Schema SQL
1. Ve a **SQL Editor** en Supabase
2. Abre el archivo `src/database/schema.sql`
3. Copia TODO el contenido
4. Pega en SQL Editor
5. Click **RUN**
6. Espera confirmación ✅

### 4. Iniciar Servidor
```powershell
npm run dev
```

Deberías ver:
```
🚀 Servidor corriendo en: http://localhost:3000
```

### 5. Probar API
Abre: http://localhost:3000/health

Deberías recibir:
```json
{
  "success": true,
  "message": "El Artesano API funcionando correctamente"
}
```

---

## 🔧 CONFIGURACIÓN DETALLADA

### Mercado Pago (Pagos)

#### Modo Sandbox (Desarrollo)
1. Ve a: https://www.mercadopago.com.ar/developers
2. Crea una cuenta de desarrollador
3. Ve a **Tus aplicaciones** > **Crear aplicación**
4. Nombre: "El Artesano"
5. Producto: "Pagos online"
6. Copia las **credenciales de prueba**:
   - Access Token → `MP_ACCESS_TOKEN`
   - Public Key → `MP_PUBLIC_KEY`

#### Tarjetas de Prueba
```
APROBADA:
  Número: 5031 7557 3453 0604
  CVV: 123
  Vencimiento: 11/25
  Titular: APRO

RECHAZADA:
  Número: 5031 4332 1540 6351
  CVV: 123
  Vencimiento: 11/25
  Titular: OTHE
```

### Resend (Emails)

1. Ve a: https://resend.com
2. Regístrate (gratis - 100 emails/día)
3. **Verifica tu dominio** (o usa sandbox):
   - Dominio sandbox: `onboarding@resend.dev`
   - Para dominio propio: agrega registros DNS
4. Genera API Key:
   - Ve a **API Keys** > **Create API Key**
   - Copia → `RESEND_API_KEY`

**Importante**: En desarrollo puedes usar el sandbox, pero en producción DEBES verificar tu dominio.

### Twilio (WhatsApp)

#### Opción 1: Sandbox (Desarrollo)
1. Ve a: https://www.twilio.com/try-twilio
2. Regístrate gratis
3. Ve a **Console** > **Messaging** > **Try it out** > **Send a WhatsApp message**
4. Sigue las instrucciones para unirte al Sandbox
5. Copia credenciales:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
   - WhatsApp From → `whatsapp:+14155238886`

#### Opción 2: Sin WhatsApp (Solo Emails)
Deja las variables de Twilio vacías. El sistema funcionará sin WhatsApp.

---

## 📁 ARCHIVOS FALTANTES (A CREAR)

He creado la estructura base. Los siguientes archivos necesitan ser completados:

### ✅ YA CREADOS (Funcionales):
- ✅ package.json
- ✅ .env.example
- ✅ README.md
- ✅ server.js (servidor Express)
- ✅ src/config/ (todas las configuraciones)
- ✅ src/database/schema.sql (schema completo)
- ✅ src/database/migrate.js
- ✅ src/middleware/ (auth, admin, validation)
- ✅ src/utils/ (jwt, validators)
- ✅ src/services/email.service.js
- ✅ src/services/whatsapp.service.js
- ✅ src/controllers/auth.controller.js
- ✅ src/routes/auth.routes.js

### ⚠️ PENDIENTES (Los crearé a continuación):

**Controladores**:
- src/controllers/productos.controller.js
- src/controllers/cursos.controller.js
- src/controllers/ordenes.controller.js
- src/controllers/pagos.controller.js
- src/controllers/admin.controller.js

**Rutas**:
- src/routes/productos.routes.js
- src/routes/cursos.routes.js
- src/routes/ordenes.routes.js
- src/routes/pagos.routes.js
- src/routes/admin.routes.js

**Frontend** (HTML/CSS/JS):
- public/index.html (actualizado con auth)
- public/admin.html (panel admin)
- public/cursos.html (catálogo cursos)
- public/mi-cuenta.html (perfil usuario)
- public/js/api.js (cliente API)
- public/js/auth.js (login/registro)
- public/js/admin.js (panel admin)
- public/js/cart.js (carrito mejorado)

---

## 🗺️ ROADMAP DE IMPLEMENTACIÓN

### FASE 1: Backend Core (✅ 80% Completado)
- [x] Configuración Express
- [x] Supabase setup
- [x] Autenticación JWT
- [x] Servicios de Email/WhatsApp
- [ ] Controllers de Productos, Cursos, Órdenes
- [ ] Integración Mercado Pago
- [ ] Webhooks

### FASE 2: Frontend Auth
- [ ] Modales de Login/Registro
- [ ] Navbar con usuario logueado
- [ ] Página de perfil
- [ ] Protección de rutas

### FASE 3: E-commerce
- [ ] Carrito con sesión
- [ ] Checkout con Mercado Pago
- [ ] Confirmación automática
- [ ] Historial de pedidos

### FASE 4: Cursos
- [ ] Catálogo de cursos
- [ ] Compra de cursos
- [ ] Player de video protegido
- [ ] Acceso verificado

### FASE 5: Panel Admin
- [ ] Dashboard con estadísticas
- [ ] CRUD Productos
- [ ] CRUD Cursos
- [ ] Gestión de pedidos

---

## 🧪 TESTING

### 1. Test de Autenticación
```bash
# Registro
curl -X POST http://localhost:3000/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!",
    "nombre": "Usuario Test",
    "telefono": "+5491112345678"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

### 2. Test de Productos
```bash
# Listar productos (sin auth)
curl http://localhost:3000/api/productos
```

### 3. Test de Admin
```bash
# Login como admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elartesano.com",
    "password": "Admin123!"
  }'
```

---

## 🚨 TROUBLESHOOTING

### Error: "Supabase connection failed"
**Solución**:
1. Verifica que `.env` tenga `SUPABASE_URL` y `SUPABASE_ANON_KEY`
2. Verifica que el proyecto Supabase esté activo
3. Verifica que ejecutaste el schema.sql

### Error: "JWT secret not configured"
**Solución**:
Agrega en `.env`:
```
JWT_SECRET=un_secreto_muy_largo_y_seguro_cambiar_en_produccion
```

### Error: Module not found
**Solución**:
```powershell
npm install
```

### Puerto 3000 en uso
**Solución**:
Cambia en `.env`:
```
PORT=3001
```

---

## 📦 PRÓXIMOS PASOS

1. **Ahora mismo**: El backend de autenticación está funcionando
2. **Siguiente**: Voy a crear los controladores y rutas restantes
3. **Luego**: Frontend con modales de auth y carrito integrado
4. **Finalmente**: Panel admin completo

¿Quieres que continúe con:
A) Controladores de Productos, Cursos y Órdenes
B) Integración de Mercado Pago (Webhook)
C) Frontend con Auth UI
D) Todo junto (puede tomar tiempo)

Responde con la letra de tu elección.

---

## 💡 TIPS IMPORTANTES

1. **Nunca** commitees el archivo `.env` (ya está en .gitignore)
2. En producción, cambia `JWT_SECRET` por algo aleatorio y seguro
3. Mercado Pago: primero prueba en Sandbox, luego producción
4. Resend: verifica tu dominio antes de producción
5. Twilio: solicita número productivo solo cuando esté todo probado

---

## 📞 SOPORTE

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que Supabase esté corriendo
4. Revisa la consola del navegador para errores frontend

---

**Estado Actual**: ✅ Backend Core Funcional (Auth + Email + WhatsApp)
**Progreso**: 40% del proyecto completo
