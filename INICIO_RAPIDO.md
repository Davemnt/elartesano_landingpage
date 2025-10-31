# 🚀 Inicio Rápido - El Artesano

## ⚡ Empezar en 3 Pasos

### 1️⃣ Iniciar el Servidor

```bash
npm run dev
```

✅ El servidor se iniciará en: **http://localhost:3000**

### 2️⃣ Acceder al Panel de Administración

1. Abre: **http://localhost:3000/admin.html**
2. **Login:**
   - Contraseña predeterminada: `admin123`
   - **⚠️ IMPORTANTE:** Cámbiala después en Configuración
3. Click en **"Acceder"**

### 3️⃣ Subir tu Primer Curso

1. Abre: **http://localhost:3000/admin.html**
2. Click en **"Cursos"** (menú lateral)
3. Click en **"+ Nuevo Curso"**
4. Completa los datos:
   - Título
   - Precio
   - Descripción
   - Duración
5. Click en **"Crear Curso"**

### 4️⃣ Agregar Lecciones

1. En la tabla de cursos, click en **📝 Lecciones**
2. Click en **"+ Agregar Lección"**
3. Completa:
   - Título de la lección
   - Duración
   - URL del video (YouTube/Vimeo)
4. Click en **"Agregar Lección"**
5. Repite para cada lección del curso

**¡Listo! 🎉** Tu curso ya está en la tienda: **http://localhost:3000/cursos.html**

---

## 📹 Subir Videos (Recomendado: YouTube)

### Paso a Paso

1. **Sube tu video a YouTube:**
   - Ve a: https://studio.youtube.com
   - Click en **"Crear" → "Subir videos"**
   - Selecciona tu video

2. **Configura como "No listado":**
   - En **Visibilidad**, selecciona **"No listado"**
   - Esto hace que solo quien tenga el link pueda verlo
   - ✅ Perfecto para cursos privados

3. **Copia el enlace:**
   - Una vez subido, click en **"Compartir"**
   - Copia la URL: `https://youtube.com/watch?v=ABC123...`

4. **Pega el enlace en tu lección:**
   - En el admin, edita la lección
   - Pega la URL en el campo **"URL del Video"**
   - Guarda

**¡El video ya está disponible para tus alumnos!** 🎥

---

## 🎨 Personalizar tu Sitio

### Cambiar Logo y Colores

Edita el archivo: **index.html**

Busca estas líneas:

```html
:root {
    --primary-color: #8B4513;
    --secondary-color: #D2691E;
    --accent-color: #F4A460;
}
```

Cambia los colores a tu gusto.

### Actualizar Información de Contacto

En **index.html**, busca y modifica:

```html
<p>Av. Vélez Sarsfield 28, Villa Madero</p>
<p>+54 9 11 1234-5678</p>
<p>contacto@elartesano.com</p>
```

---

## 💳 Configurar Mercado Pago

### 1. Crear Cuenta

1. Ve a: https://www.mercadopago.com.ar
2. Crea tu cuenta (gratis)

### 2. Obtener Credenciales

1. Ve a: https://www.mercadopago.com.ar/developers
2. **Tus integraciones → Credenciales**
3. Copia:
   - **Access Token** (producción o prueba)

### 3. Configurar en el Sistema

Ejecuta:

```bash
npm run setup
```

Cuando pregunte por Mercado Pago, pega tu **Access Token**.

---

## 📧 Configurar Email (Opcional)

Para enviar emails automáticos a los clientes:

### 1. Crear Cuenta en Resend

1. Ve a: https://resend.com
2. Crea cuenta (100 emails/día gratis)

### 2. Obtener API Key

1. En Resend, ve a **API Keys**
2. Click en **"Create API Key"**
3. Copia la key

### 3. Configurar

```bash
npm run setup
```

Cuando pregunte por Email, pega tu **API Key de Resend**.

---

## 🗄️ Configurar Base de Datos (Supabase)

### ¿Cuándo es necesario?

Si quieres que los datos **persistan** (no se borren al reiniciar):

- ✅ Guardar cursos permanentemente
- ✅ Registrar ventas reales
- ✅ Gestionar alumnos

### Configuración Rápida

1. **Crear cuenta:** https://supabase.com (gratis)
2. **Crear proyecto:** Click en "New Project"
3. **Obtener credenciales:**
   - Ve a **Settings → API**
   - Copia: **URL** y **Service Role Key**

4. **Configurar:**

```bash
npm run setup
```

5. **Ejecutar schema:**
   - En Supabase, ve a **SQL Editor**
   - Copia el contenido de: `src/database/schema.sql`
   - Pega y ejecuta

**¡Listo!** Ahora los datos se guardan en la nube.

---

## ✅ Checklist de Inicio

- [ ] Servidor corriendo (`npm run dev`)
- [ ] Primer curso creado
- [ ] Lecciones agregadas
- [ ] Videos subidos a YouTube
- [ ] Enlaces de videos configurados
- [ ] Probado en: http://localhost:3000
- [ ] Probado checkout (opcional)
- [ ] Mercado Pago configurado (para ventas reales)
- [ ] Email configurado (para notificaciones)
- [ ] Supabase configurado (para persistencia)

---

## 🆘 Problemas Comunes

### El servidor no inicia

**Solución:**

```bash
# Detener procesos anteriores
taskkill /F /IM node.exe

# Reiniciar
npm run dev
```

### "Error cargando cursos"

**Solución:**
- El sistema funciona sin Supabase (usa datos de ejemplo)
- Si quieres datos reales, configura Supabase (ver arriba)

### Los videos no se reproducen

**Solución:**
- Verifica que la URL sea pública
- En YouTube, usa videos "No listados" (no "Privados")
- Prueba abrir la URL directamente en el navegador

### No llegan los emails

**Solución:**
- Verifica que configuraste Resend
- Ejecuta `npm run setup` y configura Email
- Revisa la consola del servidor para errores

---

## 📚 Más Recursos

- **Guía completa de cursos:** `COMO_SUBIR_CURSOS.md`
- **Configuración Supabase:** `GUIA_SUPABASE.md`
- **Documentación técnica:** `README_COMPLETO.md`

---

## 🎉 ¡Ya está Todo Listo!

Tu plataforma está funcionando. Ahora puedes:

1. **Crear cursos** desde el admin
2. **Vender** con Mercado Pago
3. **Entregar acceso** automáticamente por email

**¿Necesitas ayuda?** Revisa las guías o contacta al desarrollador.

---

**¡Mucha suerte con tus cursos! 🚀📚**
