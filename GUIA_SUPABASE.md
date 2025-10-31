# Guía de Configuración de Supabase

## Paso 1: Crear cuenta en Supabase

1. Ve a https://supabase.com
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto:
   - Nombre: `el-artesano-ecommerce`
   - Database Password: (guarda esta contraseña)
   - Region: South America (São Paulo) o más cercana

## Paso 2: Obtener credenciales

Una vez creado el proyecto, ve a **Settings > API**:

1. Copia **Project URL** → Esta es tu `SUPABASE_URL`
2. Copia **anon public** key → Esta es tu `SUPABASE_ANON_KEY`
3. Copia **service_role** key → Esta es tu `SUPABASE_SERVICE_KEY` (¡mantener en secreto!)

## Paso 3: Ejecutar el Schema SQL

1. En Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia TODO el contenido de `src/database/schema.sql`
4. Pega y ejecuta el SQL
5. Verifica que las tablas se crearon en **Table Editor**

## Paso 4: Configurar Storage para imágenes

1. Ve a **Storage** en Supabase
2. Crea un bucket llamado `productos-imagenes` (público)
3. Crea un bucket llamado `cursos-videos` (privado con políticas)
4. Crea un bucket llamado `cursos-imagenes` (público)

### Políticas de Storage (cursos-videos):

```sql
-- Permitir lectura solo a usuarios autenticados que compraron el curso
CREATE POLICY "Usuarios pueden ver sus videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cursos-videos' 
  AND EXISTS (
    SELECT 1 FROM usuarios_cursos uc
    WHERE uc.usuario_id = auth.uid()
    AND storage.foldername(name)[1] = uc.curso_id::text
  )
);
```

## Paso 5: Configurar Variables de Entorno

Edita el archivo `.env` con tus credenciales:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_KEY=tu-service-role-key-aqui

# JWT
JWT_SECRET=genera-un-secreto-aleatorio-seguro-aqui

# Mercado Pago
MP_ACCESS_TOKEN=TEST-tu-access-token-aqui
MP_PUBLIC_KEY=TEST-tu-public-key-aqui
MP_WEBHOOK_SECRET=tu-webhook-secret-opcional

# Email (Resend)
RESEND_API_KEY=re_tu-api-key-aqui

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# URLs
WEBHOOK_BASE_URL=https://tu-dominio.com
CLIENT_URL=https://tu-dominio.com
SUCCESS_URL=https://tu-dominio.com/pago-exitoso.html
FAILURE_URL=https://tu-dominio.com/pago-fallido.html
PENDING_URL=https://tu-dominio.com/pago-pendiente.html

# Puerto
PORT=3000
NODE_ENV=development
```

## Paso 6: Ejecutar migración

```bash
npm run migrate
```

Esto creará el usuario admin por defecto:
- Email: admin@elartesano.com
- Password: admin123 (¡CAMBIAR INMEDIATAMENTE!)

## Paso 7: Verificar conexión

Inicia el servidor y verifica:

```bash
npm run dev
```

Prueba:
- GET http://localhost:3000/health
- GET http://localhost:3000/api/productos
- GET http://localhost:3000/api/cursos

## Paso 8: Subir imágenes de ejemplo

1. Ve a Storage > productos-imagenes
2. Sube imágenes para tus productos
3. Copia las URLs públicas
4. Actualiza los productos en la base de datos con las URLs

## Servicios Opcionales

### Mercado Pago (para pagos)
1. Crea cuenta en https://www.mercadopago.com.ar/developers
2. Obtén tus credenciales de TEST
3. Configura webhook en tu cuenta MP apuntando a: `https://tu-dominio.com/api/pagos/webhook`

### Resend (para emails)
1. Crea cuenta en https://resend.com
2. Verifica tu dominio o usa el de prueba
3. Obtén tu API key

### Twilio (para WhatsApp)
1. Crea cuenta en https://www.twilio.com
2. Activa WhatsApp sandbox para pruebas
3. Obtén credenciales

## Listo! 🎉

Tu e-commerce está configurado y listo para usar.
