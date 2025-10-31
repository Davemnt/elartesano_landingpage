# 📚 Cómo Subir Cursos al Sistema

## 🎯 Acceso al Panel de Administración

1. **Abrir el navegador** en: `http://localhost:3000/admin.html`
2. El sistema está configurado **SIN LOGIN** por ahora (puedes agregarlo después)
3. Haz clic en **"Cursos"** en el menú lateral

---

## ➕ Crear un Nuevo Curso

### Paso 1: Abrir el Formulario

1. Haz clic en el botón **"+ Nuevo Curso"** (arriba a la derecha)
2. Se abrirá un formulario modal

### Paso 2: Completar Información Básica

**Campos Obligatorios (marcados con *):**

- **Título del Curso:** Nombre descriptivo
  - Ejemplo: `Panadería Básica - Primeros Pasos`
  
- **Precio ($):** Valor en pesos argentinos
  - Ejemplo: `2500`
  
- **Descripción:** Qué aprenderán los alumnos
  - Ejemplo: `Aprende los fundamentos de la panadería artesanal desde cero. Masa madre, fermentación y técnicas básicas.`
  
- **Duración (horas):** Total de horas del curso
  - Ejemplo: `8` o `8.5`

**Campos Opcionales:**

- **Nivel:** Principiante / Intermedio / Avanzado
- **Imagen URL:** Link a imagen de portada
  - Si no tienes una, usa: `https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800`
  
- **Activo:** ✅ Marcar para que se vea en la tienda
- **Curso Destacado:** ⭐ Marcar para destacarlo en la página principal

### Paso 3: Guardar el Curso

1. Haz clic en **"Crear Curso"**
2. Verás un mensaje de confirmación: **"✅ Curso creado exitosamente"**
3. El curso aparecerá en la lista

---

## 📝 Agregar Lecciones y Contenido

### ✅ Interfaz Visual (Recomendado)

Ahora puedes gestionar las lecciones directamente desde el panel de administración:

#### 1. Acceder al Gestor de Lecciones

1. En la tabla de cursos, haz clic en el botón **📝 Lecciones**
2. Se abrirá un modal con todas las lecciones del curso

#### 2. Agregar Nueva Lección

1. Click en **"+ Agregar Lección"**
2. Completa el formulario:
   - **Título:** Nombre de la lección (Ej: "Introducción a la Panadería")
   - **Duración:** Tiempo estimado (Ej: "30 min")
   - **URL del Video:** Link de YouTube, Vimeo, etc.
   - **Descripción:** Opcional, breve resumen

3. Click en **"Agregar Lección"**
4. ¡Listo! La lección aparecerá en la lista

#### 3. Editar Lección Existente

1. Click en el botón **✏️ Editar** junto a la lección
2. Modifica los campos que necesites
3. Click en **"Guardar Cambios"**

#### 4. Ordenar Lecciones

- **↑ Flecha arriba:** Mover lección hacia arriba
- **↓ Flecha abajo:** Mover lección hacia abajo

El orden se guarda automáticamente y es el que verán los alumnos.

#### 5. Eliminar Lección

1. Click en el botón **🗑️ Eliminar**
2. Confirma la acción
3. La lección se eliminará permanentemente

### Método Alternativo: Edición Manual en Supabase

Si prefieres editar directamente en la base de datos:

1. **Accede a Supabase** → Tabla `cursos`
2. **Busca tu curso** por el título
3. **Edita el campo `contenido`** con este formato JSON:

```json
[
  {
    "titulo": "Introducción a la Panadería",
    "duracion": "30 min",
    "video_url": "https://youtube.com/watch?v=...",
    "material": []
  },
  {
    "titulo": "Masa Madre - Creación y Mantenimiento",
    "duracion": "45 min",
    "video_url": "https://youtube.com/watch?v=...",
    "material": ["guia-masa-madre.pdf"]
  },
  {
    "titulo": "Técnicas de Amasado",
    "duracion": "60 min",
    "video_url": "https://vimeo.com/...",
    "material": []
  }
]
```

### 💡 Ventajas de la Interfaz Visual

✅ **Fácil de usar** - No necesitas saber JSON  
✅ **Vista previa** - Ves cómo quedará el curso  
✅ **Ordenar con clicks** - Arrastra y suelta lecciones  
✅ **Validaciones** - Te avisa si falta algún campo  
✅ **Sin errores** - No te equivocas con la sintaxis

---

## 🎥 Opciones para Videos

### Opción 1: YouTube (Recomendado)

**Ventajas:**
- ✅ Gratis e ilimitado
- ✅ Streaming confiable
- ✅ No consume tu servidor

**Cómo usarlo:**
1. Sube los videos a YouTube como **"No listados"** (así solo los que tengan el link pueden verlos)
2. Copia la URL del video: `https://youtube.com/watch?v=ABC123`
3. Pégala en el campo `video_url` de cada lección

### Opción 2: Vimeo

**Ventajas:**
- ✅ Más profesional
- ✅ Sin anuncios
- ✅ Control de privacidad

**Limitaciones:**
- ⚠️ Plan gratuito: 500 MB/semana
- 💰 Plan Plus ($7/mes): 250 GB/año

### Opción 3: Supabase Storage (Próximamente)

**Ventajas:**
- ✅ Totalmente privado
- ✅ Control total

**Limitaciones:**
- ⚠️ Requiere configuración adicional
- ⚠️ Costos de almacenamiento (1 GB gratis)

---

## 🛠️ Gestionar Cursos Existentes

### Ver Todos los Cursos

En el panel de **Cursos** verás una tabla con:
- Título y nivel
- Precio
- Cantidad de alumnos
- Estado (Activo/Inactivo)
- Botones de acción

### Acciones Disponibles

| Botón | Acción |
|-------|--------|
| ✏️ **Editar** | Modificar título, precio, descripción |
| 📝 **Lecciones** | Gestionar contenido del curso |
| 👁️ **Activar/Desactivar** | Mostrar u ocultar en la tienda |
| 🗑️ **Eliminar** | Dar de baja el curso |

### Activar/Desactivar un Curso

1. Haz clic en el ícono del **ojo** (👁️)
2. Confirma la acción
3. El curso se ocultará/mostrará en la tienda automáticamente

### Eliminar un Curso

1. Haz clic en el **icono de basura** (🗑️)
2. **Confirma** que deseas eliminarlo
3. El curso se desactiva (no se borra de la base de datos)

---

## 📊 Visualización en la Tienda

Una vez creado el curso:

### En la Página Principal (`index.html`)

Si marcaste el curso como **"Destacado"**, aparecerá en la sección de cursos del inicio.

### En la Página de Cursos (`/cursos.html`)

Todos los cursos **activos** aparecen listados aquí con:
- Imagen
- Título y descripción
- Precio
- Nivel y duración
- Botón **"Comprar Curso"**

---

## 🔐 Sistema de Acceso Sin Login

Cuando un cliente compra un curso:

1. **Paga con Mercado Pago**
2. **El sistema automáticamente:**
   - Genera un token único
   - Crea el acceso en la base de datos
   - Envía un **email con enlace mágico**
3. **El cliente hace clic** en el enlace
4. **Accede al curso directamente** sin necesidad de login

**Enlace tipo:**
```
https://tudominio.com/acceder-curso.html?token=sha256hash123...
```

El cliente puede:
- ✅ Ver todas las lecciones
- ✅ Seguir su progreso
- ✅ Volver cuando quiera con el mismo enlace
- ✅ No necesita recordar contraseñas

---

## ⚙️ Configuración de Supabase

Para que todo funcione correctamente:

### 1. Crear Base de Datos

```bash
npm run setup
```

Sigue las instrucciones para configurar:
- Supabase URL
- Supabase Service Key
- Mercado Pago
- Email (Resend)
- WhatsApp (Twilio)

### 2. Ejecutar Schema

En tu dashboard de Supabase:
1. Ve a **SQL Editor**
2. Copia el contenido de `src/database/schema.sql`
3. Ejecuta el script completo

Esto creará todas las tablas necesarias:
- ✅ `cursos`
- ✅ `accesos_cursos`
- ✅ `orden_items`
- ✅ `ordenes`
- ✅ `pagos`

---

## 🎓 Ejemplo Completo

### Crear el curso "Panadería Básica"

1. **Abrir panel admin:** `http://localhost:3000/admin.html`
2. **Ir a Cursos** → Click en "Nuevo Curso"
3. **Completar:**
   - Título: `Panadería Básica - Primeros Pasos`
   - Precio: `2500`
   - Descripción: `Aprende los fundamentos de la panadería artesanal`
   - Duración: `8`
   - Nivel: `Principiante`
   - ✅ Activo
   - ✅ Destacado
4. **Click en "Crear Curso"**
5. **Editar en Supabase** → Agregar lecciones al campo `contenido`
6. **¡Listo!** El curso ya está en la tienda

---

## 🆘 Problemas Comunes

### "Error al crear el curso"

**Solución:**
- Verifica que Supabase esté configurado (`npm run setup`)
- Revisa que el archivo `.env` tenga las credenciales correctas
- Comprueba que ejecutaste el `schema.sql` en Supabase

### "No se ven los cursos en la tienda"

**Solución:**
- Verifica que el curso esté marcado como **"Activo"**
- Refresca la página de cursos (`/cursos.html`)
- Revisa la consola del navegador (F12) para errores

### "Los videos no se reproducen"

**Solución:**
- Verifica que las URLs sean públicas (YouTube no listado o Vimeo con permisos)
- Asegúrate de usar URLs completas: `https://youtube.com/watch?v=...`
- Prueba abrir la URL del video directamente en el navegador

---

## 📞 Soporte

Si necesitas ayuda:
- 📧 Contacta al desarrollador
- 📖 Revisa `README_COMPLETO.md` para documentación técnica
- 🔍 Consulta `GUIA_SUPABASE.md` para configuración de base de datos

---

**¡Listo para crear cursos increíbles! 🚀**
