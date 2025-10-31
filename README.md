# 🥖 El Artesano - E-commerce Completo

Sistema de e-commerce completo para panadería artesanal con pagos automáticos, gestión de cursos digitales y panel de administración.

## ✨ Características

### Para Clientes
- ✅ Registro y login de usuarios
- ✅ Catálogo de productos con carrito inteligente
- ✅ Checkout integrado con Mercado Pago
- ✅ Confirmación automática de pedidos por email y WhatsApp
- ✅ Historial de compras
- ✅ Acceso a cursos de panadería (contenido digital)
- ✅ Seguimiento de pedidos

### Para Administradores
- ✅ Panel de administración completo
- ✅ CRUD de productos y cursos
- ✅ Gestión de pedidos en tiempo real
- ✅ Dashboard con estadísticas
- ✅ Control de stock
- ✅ Notificaciones automáticas

### Sistema de Pagos
- ✅ Integración completa con Mercado Pago
- ✅ Múltiples métodos: tarjeta, transferencia, efectivo
- ✅ Webhooks para confirmación automática
- ✅ Estados de orden automatizados

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: JWT + Supabase Auth
- **Pagos**: Mercado Pago SDK
- **Emails**: Resend
- **WhatsApp**: Twilio API
- **Storage**: Supabase Storage

## 📦 Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/el-artesano.git
cd el-artesano
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

#### Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia `SUPABASE_URL` y `SUPABASE_ANON_KEY` desde Project Settings > API

#### Mercado Pago
1. Regístrate en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
2. Crea una aplicación
3. Copia tus credenciales de prueba (Sandbox)
4. En producción, usa las credenciales reales

#### Resend (Email)
1. Regístrate en [resend.com](https://resend.com)
2. Verifica tu dominio
3. Genera una API Key

#### Twilio (WhatsApp)
1. Regístrate en [twilio.com](https://www.twilio.com)
2. Activa WhatsApp Sandbox para desarrollo
3. Copia tus credenciales

### 4. Crear base de datos
```bash
npm run migrate
```

Esto creará todas las tablas necesarias en Supabase.

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor estará en `http://localhost:3000`

### 6. Abrir frontend
Abre `index.html` en tu navegador o usa un servidor local:
```bash
# Con Python
python -m http.server 5500

# Con Node.js
npx http-server -p 5500
```

## 📚 Estructura del Proyecto

```
el-artesano/
├── src/
│   ├── config/
│   │   ├── supabase.js          # Configuración Supabase
│   │   ├── mercadopago.js       # Configuración MP
│   │   └── email.js             # Configuración Resend
│   ├── database/
│   │   ├── migrate.js           # Script de migraciones
│   │   └── schema.sql           # Schema completo
│   ├── middleware/
│   │   ├── auth.js              # Verificación JWT
│   │   ├── admin.js             # Verificación admin
│   │   └── validation.js        # Validaciones
│   ├── routes/
│   │   ├── auth.routes.js       # Login, registro
│   │   ├── productos.routes.js  # CRUD productos
│   │   ├── cursos.routes.js     # CRUD cursos
│   │   ├── ordenes.routes.js    # Gestión órdenes
│   │   ├── pagos.routes.js      # Mercado Pago
│   │   └── admin.routes.js      # Panel admin
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── productos.controller.js
│   │   ├── cursos.controller.js
│   │   ├── ordenes.controller.js
│   │   ├── pagos.controller.js
│   │   └── admin.controller.js
│   ├── services/
│   │   ├── email.service.js     # Envío de emails
│   │   ├── whatsapp.service.js  # Envío WhatsApp
│   │   └── upload.service.js    # Subida archivos
│   └── utils/
│       ├── jwt.js               # Generación JWT
│       └── validators.js        # Validadores
├── public/
│   ├── index.html               # Landing page
│   ├── admin.html               # Panel admin
│   ├── cursos.html              # Catálogo cursos
│   ├── mi-cuenta.html           # Perfil usuario
│   ├── css/
│   │   ├── main.css
│   │   └── admin.css
│   └── js/
│       ├── app.js               # Lógica principal
│       ├── auth.js              # Login/Registro
│       ├── cart.js              # Carrito
│       ├── admin.js             # Panel admin
│       └── api.js               # Cliente API
├── img/                         # Imágenes
├── .env.example                 # Ejemplo variables
├── .gitignore
├── package.json
├── server.js                    # Punto de entrada
└── README.md
```

## 🔐 Credenciales de Prueba

### Usuario Admin
```
Email: admin@elartesano.com
Password: Admin123!
```

### Usuario Cliente (Test)
```
Email: cliente@test.com
Password: Test123!
```

### Mercado Pago (Sandbox)
Usar tarjetas de prueba de Mercado Pago:
- **Aprobado**: 5031 7557 3453 0604
- **Rechazado**: 5031 4332 1540 6351
- CVV: 123
- Vencimiento: Cualquier fecha futura

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/registro        # Registrar usuario
POST   /api/auth/login           # Iniciar sesión
POST   /api/auth/logout          # Cerrar sesión
POST   /api/auth/recuperar       # Recuperar contraseña
GET    /api/auth/me              # Usuario actual
```

### Productos
```
GET    /api/productos            # Listar todos
GET    /api/productos/:id        # Ver detalle
POST   /api/admin/productos      # Crear (admin)
PUT    /api/admin/productos/:id  # Actualizar (admin)
DELETE /api/admin/productos/:id  # Eliminar (admin)
```

### Cursos
```
GET    /api/cursos               # Listar todos
GET    /api/cursos/:id           # Ver detalle
GET    /api/mis-cursos           # Cursos del usuario
POST   /api/admin/cursos         # Crear (admin)
PUT    /api/admin/cursos/:id     # Actualizar (admin)
DELETE /api/admin/cursos/:id     # Eliminar (admin)
```

### Órdenes
```
POST   /api/ordenes              # Crear orden
GET    /api/ordenes/:id          # Ver orden
GET    /api/mis-ordenes          # Órdenes del usuario
GET    /api/admin/ordenes        # Todas (admin)
PUT    /api/admin/ordenes/:id    # Actualizar estado (admin)
```

### Pagos
```
POST   /api/pagos/preferencia    # Crear preferencia MP
POST   /api/pagos/webhook        # Webhook MP
GET    /api/pagos/verificar/:id  # Verificar pago
```

### Admin
```
GET    /api/admin/dashboard      # Estadísticas
GET    /api/admin/ventas         # Reporte ventas
```

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)
```bash
npm i -g vercel
vercel
```

### Opción 2: Railway
1. Conecta tu repo de GitHub
2. Agrega variables de entorno
3. Deploy automático

### Opción 3: Render
1. Crea Web Service
2. Conecta repo
3. Build: `npm install`
4. Start: `npm start`

## 🔧 Configuración Adicional

### Webhook de Mercado Pago
1. Ve a tu aplicación en Mercado Pago
2. Configura Webhook URL: `https://tu-dominio.com/api/pagos/webhook`
3. Selecciona eventos: `payment`

### Dominio de Email (Resend)
1. Agrega tu dominio en Resend
2. Configura registros DNS (MX, TXT)
3. Verifica dominio

### WhatsApp Production (Twilio)
1. Solicita aprobación del número
2. Crea templates de mensajes
3. Actualiza variables de entorno

## 🧪 Testing

```bash
# Test completo de compra
1. Registrarse como usuario
2. Agregar productos al carrito
3. Checkout con tarjeta de prueba
4. Verificar email de confirmación
5. Verificar WhatsApp

# Test panel admin
1. Login como admin
2. Crear/editar producto
3. Ver pedidos
4. Cambiar estado de pedido
```

## 📊 Base de Datos Schema

Ver archivo completo en `src/database/schema.sql`

Tablas principales:
- `usuarios` - Usuarios y admins
- `productos` - Catálogo de productos
- `cursos` - Cursos digitales
- `ordenes` - Pedidos
- `orden_items` - Items de cada pedido
- `pagos` - Transacciones
- `usuarios_cursos` - Cursos comprados

## 🆘 Troubleshooting

### Error: "Supabase connection failed"
- Verifica `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Revisa que el proyecto Supabase esté activo

### Error: "Mercado Pago preferences failed"
- Confirma que `MP_ACCESS_TOKEN` sea válido
- En sandbox, usa credenciales de prueba

### Emails no se envían
- Verifica dominio en Resend
- Revisa que `RESEND_API_KEY` sea correcta
- Chequea límite de 100 emails/día (plan gratuito)

### WhatsApp no funciona
- Confirma que Twilio Sandbox esté activo
- Verifica que el número esté registrado en sandbox
- Revisa formato: `whatsapp:+549...`

## 📝 Licencia

MIT License - El Artesano 2025

## 👨‍💻 Soporte

Para soporte técnico:
- Email: soporte@elartesano.com
- WhatsApp: +54 9 11 1234-5678
- GitHub Issues: [crear issue](https://github.com/tu-usuario/el-artesano/issues)

---

**Desarrollado con ❤️ en Buenos Aires, Argentina**
