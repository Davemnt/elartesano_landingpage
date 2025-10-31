# 🔐 Acceso al Panel de Administración

## 🚀 Inicio Rápido

### 1. Acceder al Panel

1. **Abre tu navegador** en:
   ```
   http://localhost:3000/admin.html
   ```

2. **Se mostrará la pantalla de login:**
   - Contraseña predeterminada: `admin123`

3. **Ingresa la contraseña** y click en "Acceder"

4. **¡Listo!** Ya estás en el panel de administración

---

## 🔒 Primera Vez: Cambiar Contraseña

**⚠️ MUY IMPORTANTE:** Cambia la contraseña predeterminada la primera vez que accedas.

### Paso a Paso:

1. Una vez dentro del panel, ve a **"Configuración"** (menú lateral)
2. En la sección **"Seguridad"**, verás el formulario de cambio de contraseña
3. Completa:
   - **Contraseña Actual:** `admin123`
   - **Nueva Contraseña:** Tu contraseña segura (mínimo 6 caracteres)
4. Click en **"Cambiar Contraseña"**
5. **¡Listo!** Tu panel ya está protegido

### 💡 Recomendaciones de Contraseña:

- ✅ Mínimo 8 caracteres
- ✅ Combina letras, números y símbolos
- ✅ No uses palabras comunes
- ✅ Ejemplo: `PanDulce2025!`

**⚠️ GUARDA TU CONTRASEÑA:** No hay forma de recuperarla si la olvidas. Deberás modificar el código.

---

## 🚪 Cerrar Sesión

Para salir del panel de forma segura:

1. **Opción 1:** Click en **"Cerrar Sesión"** (menú lateral)
2. **Opción 2:** Click en **"Cerrar Sesión"** (arriba a la derecha)

La próxima vez que accedas, deberás ingresar la contraseña nuevamente.

---

## 🔑 ¿Olvidaste tu Contraseña?

Si olvidaste la contraseña que configuraste:

### Opción 1: Restablecer desde la Consola del Navegador

1. **Abre la consola del navegador:**
   - En Windows/Linux: Presiona `F12`
   - En Mac: `Cmd + Option + I`

2. **Ve a la pestaña "Console"**

3. **Escribe y presiona Enter:**
   ```javascript
   localStorage.setItem('admin_password', 'admin123')
   ```

4. **Recarga la página:** `F5`

5. **Ahora puedes acceder** con la contraseña: `admin123`

### Opción 2: Limpiar Datos del Navegador

1. **Presiona:** `Ctrl + Shift + Delete` (o `Cmd + Shift + Delete` en Mac)
2. **Selecciona:** "Datos de sitios web" o "Cookies y datos de sitios"
3. **Limpia** los datos
4. **Recarga** la página
5. **Accede** con: `admin123`

---

## 🌐 Acceso desde Otros Dispositivos

### En la Misma Red (WiFi):

1. **Encuentra tu IP local:**
   - Windows: Abre CMD y escribe: `ipconfig`
   - Busca "Dirección IPv4": Ej: `192.168.1.100`

2. **En otro dispositivo** (tablet, celular, otra PC):
   ```
   http://192.168.1.100:3000/admin.html
   ```
   *(Reemplaza con tu IP)*

3. **Ingresa la contraseña** que configuraste

### Desde Internet (Avanzado):

Si quieres acceder desde fuera de tu red:

1. **Debes configurar:**
   - Port forwarding en tu router (puerto 3000)
   - O usar servicios como ngrok, Cloudflare Tunnel
   - O deployar en un servidor (Heroku, Railway, etc.)

2. **Recomendación:** Esto es avanzado, consulta con tu desarrollador

---

## 🛡️ Seguridad

### ¿Es Seguro?

El sistema actual usa:
- ✅ Contraseña almacenada localmente
- ✅ Sin exposición en el código fuente
- ✅ Protección básica contra accesos no autorizados

### Para Producción:

Si vas a usar esto en un sitio real en Internet:

1. **Configura autenticación con Supabase:**
   - Ejecuta: `npm run setup`
   - Configura las credenciales de Supabase
   - Esto agregará autenticación de base de datos

2. **Usa HTTPS:**
   - Nunca accedas al admin por HTTP en producción
   - Usa un certificado SSL

3. **Cambia la contraseña regularmente**

---

## 📱 Acceso Móvil

Puedes administrar desde tu celular o tablet:

1. **Asegúrate** de estar en la misma WiFi
2. **Abre el navegador** en tu dispositivo móvil
3. **Accede a:** `http://TU_IP:3000/admin.html`
4. **Ingresa tu contraseña**

**Nota:** La interfaz es responsive y se adapta a pantallas pequeñas.

---

## ⚙️ Configuración Avanzada

### Cambiar la Contraseña Predeterminada en el Código:

Si quieres cambiar `admin123` antes de que alguien acceda:

1. **Abre:** `admin.html`
2. **Busca la línea** (aproximadamente línea 572):
   ```javascript
   const ADMIN_PASSWORD = 'admin123';
   ```
3. **Cambia por tu contraseña:**
   ```javascript
   const ADMIN_PASSWORD = 'tuPasswordSegura2025';
   ```
4. **Guarda el archivo**
5. **Reinicia el servidor:** `npm run dev`

---

## 🆘 Problemas Comunes

### "No puedo acceder, la contraseña no funciona"

**Solución:**
1. Verifica que estés usando la contraseña correcta
2. Si es la primera vez, usa: `admin123`
3. Si cambiaste la contraseña y no la recuerdas, sigue los pasos de "¿Olvidaste tu Contraseña?"

### "El panel no carga"

**Solución:**
1. Verifica que el servidor esté corriendo: `npm run dev`
2. Revisa la URL: debe ser `http://localhost:3000/admin.html`
3. Abre la consola del navegador (F12) y busca errores

### "Cambié la contraseña pero sigue pidiendo la anterior"

**Solución:**
1. Limpia la caché del navegador: `Ctrl + F5`
2. O ve a Configuración → "Limpiar Caché del Navegador"

---

## 📞 Soporte

Si tienes problemas:
- 📖 Revisa: `INICIO_RAPIDO.md`
- 📚 Consulta: `README_COMPLETO.md`
- 💬 Contacta al desarrollador

---

## ✅ Checklist de Seguridad

- [ ] Accedí al panel con `admin123`
- [ ] Cambié la contraseña predeterminada
- [ ] Guardé mi nueva contraseña en un lugar seguro
- [ ] Probé cerrar sesión y volver a entrar
- [ ] Configuré acceso solo desde redes seguras

---

**¡Tu panel está listo y protegido! 🎉🔒**
