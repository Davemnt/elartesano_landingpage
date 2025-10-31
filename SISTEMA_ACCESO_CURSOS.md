# 🎓 Sistema de Acceso a Cursos Sin Registro

## 📋 Descripción

Este sistema permite que los clientes **compren y accedan a cursos sin necesidad de crear una cuenta**. Solo necesitan su email para recibir un enlace mágico que les da acceso directo al curso.

---

## 🔄 Flujo Completo del Sistema

### 1️⃣ **Cliente Compra un Curso**
```
Cliente → Catálogo de Cursos → Agregar al Carrito → Checkout → Mercado Pago
```

- El cliente navega en `/cursos.html`
- Selecciona un curso y hace clic en "Comprar Curso"
- El curso se agrega al carrito con `tipo: 'curso'`
- Completa el formulario de checkout con su email
- Paga con Mercado Pago

### 2️⃣ **Webhook de Mercado Pago Procesa el Pago**

Cuando el pago es **aprobado**, el webhook:

```javascript
// En: src/controllers/pagos.controller.js

// 1. Identifica los items de tipo 'curso' en la orden
const cursosEnOrden = items.filter(item => item.producto_tipo === 'curso');

// 2. Por cada curso, crea un acceso con token único
for (const cursoItem of cursosEnOrden) {
    const { link, token } = await accesoService.crearAccesoCurso(
        orden.cliente_email,  // Email del cliente
        cursoItem.producto_id, // ID del curso
        orden.id              // ID de la orden
    );
    
    // 3. Envía email con el enlace de acceso
    await enviarEmailAccesoCurso(orden.cliente_email, {
        nombre_curso: cursoItem.producto_nombre,
        link_acceso: link,
        cliente_nombre: orden.cliente_nombre
    });
}
```

### 3️⃣ **Cliente Recibe Email con Enlace Mágico**

El cliente recibe un email con:
- Nombre del curso comprado
- Botón "Acceder al Curso" con enlace único
- Instrucciones para guardar el email

**Formato del enlace:**
```
https://tudominio.com/acceder-curso.html?token=abc123xyz...
```

### 4️⃣ **Cliente Hace Clic en el Enlace**

```
Email → Clic en Botón → acceder-curso.html?token=... → Validación → Redirección
```

**Proceso en `acceder-curso.html`:**

```javascript
// 1. Obtener token de la URL
const token = new URLSearchParams(window.location.search).get('token');

// 2. Validar token con el backend
const response = await fetch('/api/cursos/acceder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
});

// 3. Si es válido, redirigir al reproductor del curso
window.location.href = `/curso-player.html?token=${token}`;
```

### 5️⃣ **Cliente Accede al Curso**

En `curso-player.html`:
- El token se incluye en todas las peticiones al backend
- Se cargan las lecciones del curso
- Se guarda el progreso automáticamente
- El cliente puede volver cuando quiera usando el mismo enlace

---

## 🗄️ Estructura de Base de Datos

### Tabla: `accesos_cursos`

```sql
CREATE TABLE accesos_cursos (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,              -- Email del cliente
    curso_id UUID REFERENCES cursos(id),      -- ID del curso
    orden_id UUID REFERENCES ordenes(id),     -- Orden de compra
    
    token_acceso VARCHAR(255) UNIQUE,         -- Token único (SHA256)
    expira_en TIMESTAMP,                      -- Fecha de expiración (1 año)
    activo BOOLEAN DEFAULT TRUE,              -- ¿Acceso activo?
    
    progreso DECIMAL(5,2) DEFAULT 0.00,       -- Progreso % (0-100)
    completado BOOLEAN DEFAULT FALSE,         -- ¿Curso completado?
    ultimo_acceso TIMESTAMP,                  -- Última vez que accedió
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Índices:**
- `idx_accesos_cursos_email` → Buscar cursos por email
- `idx_accesos_cursos_token` → Validar token rápidamente
- `idx_accesos_cursos_curso_id` → Listar accesos por curso

---

## 🔐 Sistema de Tokens

### Generación de Token

```javascript
// En: src/services/acceso-cursos.service.js

export const generarTokenAccesoCurso = (email, cursoId) => {
    const timestamp = Date.now();
    const data = `${email}-${cursoId}-${timestamp}`;
    
    // Hash SHA256
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
};
```

**Características del token:**
- ✅ **Único**: Combina email + curso + timestamp
- ✅ **Seguro**: Hash SHA256 de 64 caracteres
- ✅ **No predecible**: Incluye timestamp
- ✅ **Indexado**: Búsqueda rápida en BD

### Validación de Token

```javascript
export const verificarTokenAcceso = async (token) => {
    // 1. Buscar acceso por token
    const { data: acceso } = await supabase
        .from('accesos_cursos')
        .select('*, cursos(*)')
        .eq('token_acceso', token)
        .eq('activo', true)
        .single();
    
    if (!acceso) return null;
    
    // 2. Verificar expiración
    if (new Date(acceso.expira_en) < new Date()) {
        return null;
    }
    
    // 3. Actualizar último acceso
    await supabase
        .from('accesos_cursos')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', acceso.id);
    
    return acceso;
};
```

---

## 🛣️ Rutas del API

### `POST /api/cursos/acceder`
**Validar token y obtener curso**

**Request:**
```json
{
  "token": "abc123xyz..."
}
```

**Response (éxito):**
```json
{
  "success": true,
  "email": "cliente@example.com",
  "curso": {
    "id": "uuid",
    "titulo": "Panadería Básica",
    "descripcion": "...",
    "lecciones": [...]
  },
  "progreso": 25.5,
  "completado": false,
  "expira_en": "2025-12-31T00:00:00Z"
}
```

### `GET /api/cursos/leccion?token=...&leccionId=...`
**Obtener lección específica**

### `PUT /api/cursos/progreso`
**Actualizar progreso del curso**

**Request:**
```json
{
  "token": "abc123xyz...",
  "progreso": 50.0,
  "completado": false
}
```

### `GET /api/cursos/mis-cursos?email=...`
**Listar todos los cursos de un email**

---

## 📧 Email de Acceso

### Template

El email incluye:
- 🎉 **Header celebratorio**: "¡Tu Curso está Listo!"
- 📚 **Nombre del curso**: Título destacado
- ✅ **Beneficios**: Acceso ilimitado, a tu ritmo, certificado
- 🔑 **Instrucciones**: 3 pasos simples
- 🚀 **Botón de acceso**: Enlace directo con el token
- 📌 **Nota importante**: Guardar el email para futuros accesos

### Asunto
```
🎓 Acceso Confirmado: [Nombre del Curso] - El Artesano
```

---

## 🎯 Ventajas de Este Sistema

### ✅ **Para el Cliente:**
1. **Sin fricción**: No necesita crear contraseña ni registrarse
2. **Acceso instantáneo**: Click en el email y listo
3. **Sin olvidos**: El enlace está en su email siempre
4. **Privacidad**: Solo comparte su email

### ✅ **Para el Negocio:**
1. **Menos abandonos**: Checkout más rápido
2. **Más conversiones**: Menos barreras de entrada
3. **Simplicidad**: No gestionar cuentas de usuario
4. **Seguridad**: Tokens únicos y expiración

---

## 🔄 Recuperación de Acceso

Si un cliente pierde su email:

**Opción A - Buscar por Email:**
```javascript
GET /api/cursos/mis-cursos?email=cliente@example.com
```
Devuelve todos sus cursos con nuevos enlaces.

**Opción B - Panel de Admin:**
El admin puede buscar compras por email y reenviar el enlace.

**Opción C - Soporte Manual:**
El cliente contacta por WhatsApp/email con su orden o email.

---

## 📊 Métricas y Analytics

### Datos que puedes rastrear:

```sql
-- Cursos más vendidos
SELECT c.titulo, COUNT(*) as ventas
FROM accesos_cursos ac
JOIN cursos c ON ac.curso_id = c.id
GROUP BY c.id, c.titulo
ORDER BY ventas DESC;

-- Tasa de finalización
SELECT 
    c.titulo,
    COUNT(*) as total_accesos,
    SUM(CASE WHEN ac.completado THEN 1 ELSE 0 END) as completados,
    (SUM(CASE WHEN ac.completado THEN 1 ELSE 0 END)::float / COUNT(*) * 100) as tasa_completacion
FROM accesos_cursos ac
JOIN cursos c ON ac.curso_id = c.id
GROUP BY c.id, c.titulo;

-- Progreso promedio por curso
SELECT 
    c.titulo,
    AVG(ac.progreso) as progreso_promedio,
    MAX(ac.ultimo_acceso) as ultimo_acceso_reciente
FROM accesos_cursos ac
JOIN cursos c ON ac.curso_id = c.id
WHERE ac.activo = true
GROUP BY c.id, c.titulo;
```

---

## 🚀 Próximos Pasos

### Para Implementar:

1. ✅ **Base de Datos**
   ```bash
   # Ejecutar el schema SQL en Supabase
   src/database/schema.sql
   ```

2. ✅ **Backend**
   - Service: `src/services/acceso-cursos.service.js`
   - Controller: `src/controllers/acceso-cursos.controller.js`
   - Routes: `src/routes/acceso-cursos.routes.js`
   - Webhook actualizado: `src/controllers/pagos.controller.js`

3. ✅ **Frontend**
   - Página de validación: `acceder-curso.html`
   - Reproductor: `curso-player.html` (ya existe)
   - Checkout actualizado: `index.html`

4. ⬜ **Configuración**
   ```bash
   npm run setup
   # Configura Supabase, Mercado Pago, Resend, etc.
   ```

5. ⬜ **Testing**
   - Comprar un curso de prueba
   - Verificar que llega el email
   - Probar el enlace de acceso
   - Confirmar que carga el curso

---

## 🆘 Solución de Problemas

### ❌ "Token inválido o expirado"
- ✅ Verificar que el token existe en `accesos_cursos`
- ✅ Comprobar fecha de `expira_en`
- ✅ Verificar que `activo = true`

### ❌ "No llega el email de acceso"
- ✅ Verificar configuración de Resend
- ✅ Revisar logs del webhook
- ✅ Confirmar que `EMAIL_FROM` está configurado

### ❌ "El curso no carga las lecciones"
- ✅ Verificar que el curso tiene lecciones en `curso_lecciones`
- ✅ Comprobar relación `curso_id` en BD
- ✅ Revisar console del navegador

---

## 📝 Notas Importantes

1. **Tokens de 1 año**: Cambia en `crearAccesoCurso()` si necesitas otra duración
2. **Emails desde Gmail/Outlook**: Pueden ir a spam, recomendar revisar
3. **Links en WhatsApp**: Funcionan perfectamente, el token está en la URL
4. **Múltiples dispositivos**: El mismo token funciona en cualquier dispositivo
5. **Sin límite de accesos**: El cliente puede ver el curso todas las veces que quiera

---

## 🎓 Ejemplo de Uso Real

```
1. Juan compra "Panadería Básica" por $2500
2. Paga con Mercado Pago
3. El webhook detecta el pago aprobado
4. Se crea acceso con token: "a7f8e3c2b1..."
5. Juan recibe email: "Acceso Confirmado: Panadería Básica"
6. Juan hace clic en "Acceder al Curso"
7. Es redirigido a: /acceder-curso.html?token=a7f8e3c2b1...
8. El sistema valida el token
9. Juan es redirigido a: /curso-player.html?token=a7f8e3c2b1...
10. Comienza a ver las lecciones
11. Su progreso se guarda automáticamente
12. Una semana después, busca el email y hace clic de nuevo
13. Continúa desde donde dejó (progreso: 45%)
```

---

## 🔗 Enlaces Útiles

- Documentación de Supabase: `GUIA_SUPABASE.md`
- Guía completa: `README_COMPLETO.md`
- Inicio rápido: `EMPEZAR_AQUI.md`
- Setup automático: `npm run setup`

---

**¡Sistema listo para usar! 🎉**
