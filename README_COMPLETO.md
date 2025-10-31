# El Artesano - E-commerce Completo

## 📖 Descripción

Plataforma e-commerce completa para panadería artesanal con:
- ✅ Catálogo de productos
- ✅ Carrito de compras
- ✅ Pagos con Mercado Pago
- ✅ Cursos online con reproductor de videos
- ✅ Panel de administración completo
- ✅ Notificaciones por Email y WhatsApp
- ✅ Sistema de autenticación
- ✅ Webhooks automáticos

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar el proyecto
```bash
npm run setup
```

Este comando interactivo te guiará para:
- Configurar Supabase
- Generar secretos de seguridad
- Configurar Mercado Pago (opcional)
- Configurar Email/WhatsApp (opcional)

### 3. Configurar Base de Datos

1. Crea cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a **SQL Editor** y ejecuta `src/database/schema.sql`
4. Ejecuta el migration para crear admin:
```bash
npm run migrate
```

### 4. Iniciar servidor
```bash
npm run dev
```

### 5. Acceder
- **Sitio web:** http://localhost:3000
- **Panel admin:** http://localhost:3000/admin.html
- **Cursos:** http://localhost:3000/cursos.html

## 📁 Estructura del Proyecto

```
El-Artesano-Landing-Page/
├── server.js                 # Servidor Express principal
├── package.json             # Dependencias
├── setup.js                 # Asistente de configuración
├── .env                     # Variables de entorno (NO versionar)
├── .env.example            # Ejemplo de variables
│
├── index.html              # Página principal
├── cursos.html            # Página de cursos
├── curso-player.html      # Reproductor de cursos
├── admin.html             # Panel de administración
├── pago-exitoso.html      # Página de confirmación
├── pago-fallido.html      # Página de error de pago
├── pago-pendiente.html    # Página de pago pendiente
│
├── img/                   # Imágenes del sitio
│
├── src/
│   ├── config/           # Configuraciones
│   │   ├── supabase.js        # Cliente Supabase
│   │   ├── mercadopago.js     # SDK Mercado Pago
│   │   ├── email.js           # Cliente Resend
│   │   └── twilio.js          # Cliente Twilio
│   │
│   ├── controllers/      # Controladores (lógica de negocio)
│   │   ├── auth.controller.js
│   │   ├── productos.controller.js
│   │   ├── cursos.controller.js
│   │   ├── ordenes.controller.js
│   │   └── pagos.controller.js
│   │
│   ├── routes/          # Rutas de la API
│   │   ├── auth.routes.js
│   │   ├── productos.routes.js
│   │   ├── cursos.routes.js
│   │   ├── ordenes.routes.js
│   │   ├── pagos.routes.js
│   │   └── admin.routes.js
│   │
│   ├── middleware/      # Middlewares
│   │   ├── auth.js           # Verificación de JWT
│   │   ├── admin.js          # Verificación de admin
│   │   └── validation.js     # Validación de requests
│   │
│   ├── services/        # Servicios externos
│   │   ├── email.service.js
│   │   └── whatsapp.service.js
│   │
│   ├── utils/           # Utilidades
│   │   ├── jwt.js
│   │   └── validators.js
│   │
│   └── database/        # Base de datos
│       ├── schema.sql        # Schema completo
│       └── migrate.js        # Script de migración
│
└── docs/               # Documentación adicional
    ├── GUIA_SUPABASE.md
    ├── IMPLEMENTACION.md
    ├── ESTADO_PROYECTO.md
    └── TESTS.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/registro` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual
- `PUT /api/auth/perfil` - Actualizar perfil
- `PUT /api/auth/password` - Cambiar contraseña

### Productos
- `GET /api/productos` - Listar productos
- `GET /api/productos/:id` - Ver producto
- `POST /api/productos` - Crear producto (admin)
- `PUT /api/productos/:id` - Actualizar producto (admin)
- `DELETE /api/productos/:id` - Eliminar producto (admin)

### Cursos
- `GET /api/cursos` - Listar cursos
- `GET /api/cursos/:id` - Ver curso
- `GET /api/cursos/mis-cursos` - Mis cursos (auth)

### Órdenes
- `POST /api/ordenes` - Crear orden
- `GET /api/ordenes` - Mis órdenes (auth)
- `GET /api/ordenes/:id` - Ver orden (auth)
- `GET /api/ordenes/admin/all` - Todas las órdenes (admin)
- `PUT /api/ordenes/:id/estado` - Actualizar estado (admin)

### Pagos
- `POST /api/pagos/preferencia` - Crear preferencia MP
- `POST /api/pagos/webhook` - Webhook de Mercado Pago

### Admin
- `GET /api/admin/dashboard` - Estadísticas

## 🗄️ Base de Datos

### Tablas principales:
- `usuarios` - Usuarios del sistema
- `productos` - Productos de la panadería
- `cursos` - Cursos disponibles
- `ordenes` - Órdenes de compra
- `orden_items` - Items de cada orden
- `pagos` - Registros de pagos
- `usuarios_cursos` - Cursos adquiridos por usuarios

### Funciones y Triggers:
- `generar_numero_orden()` - Genera número de orden secuencial
- Triggers `updated_at` en todas las tablas
- Row Level Security (RLS) habilitado

## 🔐 Seguridad

- ✅ JWT para autenticación
- ✅ Bcrypt para passwords
- ✅ Helmet para headers HTTP
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Row Level Security en Supabase
- ✅ Validación de inputs con express-validator

## 📧 Notificaciones

### Email (Resend)
- Confirmación de pedido al cliente
- Notificación de nuevo pedido al admin
- Email de acceso a curso comprado

### WhatsApp (Twilio)
- Confirmación de pedido al cliente
- Notificación al admin
- Cambios de estado del pedido

## 💳 Pagos (Mercado Pago)

1. Cliente agrega productos al carrito
2. Completa formulario de checkout
3. Se crea orden en BD
4. Se genera preferencia de Mercado Pago
5. Cliente paga en MP
6. Webhook actualiza estado de orden
7. Se envían notificaciones automáticas
8. Si es un curso, se desbloquea acceso

## 🎓 Sistema de Cursos

- Listado de cursos disponibles
- Compra integrada al carrito
- Reproductor de videos con lecciones
- Seguimiento de progreso
- Acceso restringido a cursos comprados

## 👨‍💼 Panel de Administración

- Dashboard con estadísticas
- CRUD de productos
- CRUD de cursos
- Gestión de órdenes
- Filtros y búsqueda
- Actualización de estados

## 🌐 Deployment

### Variables de entorno requeridas:
```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
MP_ACCESS_TOKEN=
RESEND_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

### Servicios recomendados:
- **Backend:** Render, Railway, Vercel
- **Base de datos:** Supabase (incluido)
- **Storage:** Supabase Storage
- **Dominio:** Cualquier registrador

## 📝 Licencia

MIT

## 👥 Soporte

Para dudas o problemas:
1. Revisa la documentación en `/docs`
2. Verifica que Supabase esté correctamente configurado
3. Revisa los logs del servidor
4. Contacta al desarrollador
