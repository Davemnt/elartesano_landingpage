import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Importar rutas (las crearemos a continuación)
import authRoutes from './src/routes/auth.routes.js';
import productosRoutes from './src/routes/productos.routes.js';
import cursosRoutes from './src/routes/cursos.routes.js';
import ordenesRoutes from './src/routes/ordenes.routes.js';
import pagosRoutes from './src/routes/pagos.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import accesoCursosRoutes from './src/routes/acceso-cursos.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ===================================
// MIDDLEWARES GLOBALES
// ===================================

// Seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false // Desactivar para servir archivos estáticos
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));

// Body parser (DEBE IR ANTES de las rutas)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Rate limiting estricto para autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // máximo 5 intentos de login por 15 minutos
    message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo más tarde.'
});

// ===================================
// RUTAS DE API (ANTES de archivos estáticos)
// ===================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'El Artesano API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test directo de productos (para debug)
app.get('/api/productos-test', (req, res) => {
    console.log('✅ /api/productos-test llamado directamente');
    res.json({
        success: true,
        message: 'Endpoint de prueba funcionando',
        data: [{ id: 1, nombre: 'Test' }]
    });
});

// Rutas de API
console.log('📌 Registrando rutas de API...');
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/cursos', accesoCursosRoutes); // Rutas de acceso sin login
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/admin', adminRoutes);
console.log('✅ Rutas de API registradas');

// ===================================
// ARCHIVOS ESTÁTICOS (DESPUÉS de las rutas API)
// ===================================

// SOLUCIÓN SIMPLE Y EFECTIVA:
// Express procesa middlewares en orden. Las rutas de API ya están registradas arriba,
// por lo que express.static solo actuará si ninguna ruta de API coincidió.

app.use(express.static(__dirname, {
    // Ignorar archivos que empiecen con api/
    setHeaders: (res, filePath) => {
        if (filePath.includes('/api/')) {
            res.status(404).send('Not Found');
        }
    }
}));

// Ruta raíz - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===================================
// MANEJO DE ERRORES
// ===================================

// Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.path
    });
});

// Manejador global de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// ===================================
// INICIAR SERVIDOR
// ===================================

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🥖 EL ARTESANO - E-COMMERCE API');
    console.log('='.repeat(60));
    console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Fecha: ${new Date().toLocaleDateString('es-AR')}`);
    console.log('='.repeat(60));
    console.log('\n📋 Endpoints disponibles:');
    console.log('  - GET  /health');
    console.log('  - POST /api/auth/registro');
    console.log('  - POST /api/auth/login');
    console.log('  - GET  /api/productos');
    console.log('  - GET  /api/cursos');
    console.log('  - POST /api/ordenes');
    console.log('  - POST /api/pagos/preferencia');
    console.log('  - POST /api/pagos/webhook');
    console.log('  - GET  /api/admin/dashboard');
    console.log('='.repeat(60) + '\n');
    
    // Verificar configuración
    console.log('🔧 Configuración:');
    console.log('  ✅ Express configurado');
    console.log(`  ${process.env.SUPABASE_URL ? '✅' : '❌'} Supabase`);
    console.log(`  ${process.env.MP_ACCESS_TOKEN ? '✅' : '❌'} Mercado Pago`);
    console.log(`  ${process.env.RESEND_API_KEY ? '✅' : '❌'} Resend (Email)`);
    console.log(`  ${process.env.TWILIO_ACCOUNT_SID ? '✅' : '❌'} Twilio (WhatsApp)`);
    console.log('='.repeat(60) + '\n');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM recibido. Cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT recibido. Cerrando servidor...');
    process.exit(0);
});

export default app;
