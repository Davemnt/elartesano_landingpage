# 🚀 EMPEZAR AQUÍ - Guía de Inicio Rápido

## ✅ TODO ESTÁ LISTO

El código completo del e-commerce está implementado. Solo falta la configuración de servicios externos.

## 📋 Checklist de Configuración

### ☑️ YA COMPLETADO
- ✅ Backend completo (Node.js + Express)
- ✅ Frontend completo (Landing, Cursos, Admin, Checkout)
- ✅ Sistema de pagos con Mercado Pago
- ✅ Sistema de notificaciones (Email/WhatsApp)
- ✅ Panel de administración
- ✅ Reproductor de cursos
- ✅ Schema de base de datos
- ✅ Documentación completa

### ⏳ LO QUE DEBES HACER (15-20 minutos)

## Paso 1: Instalar Dependencias (2 min)

```bash
npm install
```

## Paso 2: Configurar Servicios (10 min)

### A. Crear cuenta Supabase (OBLIGATORIO)

1. Ve a <https://supabase.com> y crea cuenta
2. Crea nuevo proyecto:
   - Nombre: `el-artesano`
   - Password: (anótala bien)
   - Región: South America

3. Espera 2 minutos a que se cree el proyecto

4. Ve a **Settings > API** y copia:
   - Project URL
   - anon public key
   - service_role secret key

### B. Ejecutar configuración interactiva

```bash
npm run setup
```

Este comando te pedirá:
- URL de Supabase (pegar la que copiaste)
- Anon Key (pegar)
- Service Key (pegar)
- JWT Secret (auto-genera o personaliza)

**OPCIONAL:** Presiona Enter para omitir:
- Mercado Pago (puedes agregar después)
- Resend (Email)
- Twilio (WhatsApp)

## Paso 3: Crear Base de Datos (5 min)

### A. Ejecutar Schema SQL

1. En Supabase, ve a **SQL Editor**
2. Click en **New Query**
3. Abre el archivo `src/database/schema.sql`
4. Copia **TODO** el contenido
5. Pega en el editor de Supabase
6. Click en **Run** (esquina inferior derecha)
7. Espera... verás "Success. No rows returned"

### B. Crear usuario admin

```bash
npm run migrate
```

Credenciales admin:
- Email: `admin@elartesano.com`
- Password: `admin123`

## Paso 4: Iniciar el Servidor (1 min)

```bash
npm run dev
```

Verás:

```
============================================================
🥖 EL ARTESANO - E-COMMERCE API
============================================================
🚀 Servidor corriendo en: http://localhost:3000
```

## Paso 5: ¡Probar! 🎉

### Abrir en el navegador

<http://localhost:3000>

### Navegar por el sitio

- **Inicio:** Ver productos, agregar al carrito
- **Cursos:** <http://localhost:3000/cursos.html>
- **Admin:** <http://localhost:3000/admin.html>

### Login como Admin

En `/admin.html`:

- Email: `admin@elartesano.com`
- Password: `admin123`

## 🎯 Próximos Pasos (Opcional)

### Si quieres probar pagos reales

1. Crea cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Obtén credenciales de **PRUEBA** (Sandbox)
3. Agrega a `.env`:

```env
MP_ACCESS_TOKEN=TEST-tu-token-aqui
MP_PUBLIC_KEY=TEST-tu-public-key
```

4. Reinicia el servidor: `npm run dev`

### Si quieres enviar emails

1. Crea cuenta en [Resend](https://resend.com) (100 emails gratis/día)
2. Obtén API Key
3. Agrega a `.env`:

```env
RESEND_API_KEY=re_tu-api-key
```

### Si quieres WhatsApp

1. Crea cuenta en [Twilio](https://www.twilio.com)
2. Activa WhatsApp Sandbox
3. Agrega a `.env`:

```env
TWILIO_ACCOUNT_SID=tu-sid
TWILIO_AUTH_TOKEN=tu-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## 🆘 Problemas Comunes

### Error: "EADDRINUSE: port 3000"

Hay otro servidor corriendo. Detener:

```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
killall node
```

Luego volver a: `npm run dev`

### Error: "Supabase connection failed"

Verifica que `.env` tiene:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-key-aqui
```

### Base de datos vacía

Asegúrate de haber ejecutado TODO el contenido de `schema.sql` en Supabase SQL Editor.

### No puedo hacer login como admin

Ejecuta: `npm run migrate`

Esto crea el usuario admin.

## 📚 Documentación Completa

- **`README.md`** - Documentación principal
- **`README_COMPLETO.md`** - Guía técnica detallada
- **`GUIA_SUPABASE.md`** - Configuración Supabase paso a paso
- **`IMPLEMENTACION.md`** - Decisiones técnicas
- **`ESTADO_PROYECTO.md`** - Estado actual

## ✅ Verificación Final

El sitio está funcionando si puedes:

1. ✅ Abrir <http://localhost:3000> y ver la landing page
2. ✅ Agregar productos al carrito
3. ✅ Ver cursos en `/cursos.html`
4. ✅ Hacer login en `/admin.html`
5. ✅ Ver el dashboard del admin

## 🎉 ¡Listo!

Tu e-commerce está completamente funcional. Solo falta:

1. **Subir imágenes reales** de productos (en Supabase Storage)
2. **Configurar Mercado Pago** (cuando quieras aceptar pagos)
3. **Personalizar textos** y contenidos
4. **Deploy a producción** (Render, Railway, Vercel)

---

**¿Necesitas ayuda?** Revisa las guías en `/docs` o abre un issue.
