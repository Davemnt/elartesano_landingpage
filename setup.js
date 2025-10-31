#!/usr/bin/env node

/**
 * Script de configuración inicial de El Artesano E-commerce
 * Ejecutar: node setup.js
 */

import readline from 'readline';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
    console.log('\n🥖 EL ARTESANO - CONFIGURACIÓN INICIAL\n');
    console.log('Este asistente te ayudará a configurar tu e-commerce\n');

    const config = {};

    // Supabase
    console.log('📦 SUPABASE');
    config.SUPABASE_URL = await question('URL de tu proyecto Supabase: ');
    config.SUPABASE_ANON_KEY = await question('Anon Key (pública): ');
    config.SUPABASE_SERVICE_KEY = await question('Service Role Key (privada): ');

    // JWT
    console.log('\n🔐 SEGURIDAD');
    const generarSecret = await question('¿Generar JWT_SECRET automáticamente? (s/n): ');
    if (generarSecret.toLowerCase() === 's') {
        config.JWT_SECRET = require('crypto').randomBytes(64).toString('hex');
        console.log('✅ JWT_SECRET generado');
    } else {
        config.JWT_SECRET = await question('JWT_SECRET personalizado: ');
    }

    // Mercado Pago (opcional)
    console.log('\n💳 MERCADO PAGO (opcional, presiona Enter para omitir)');
    config.MP_ACCESS_TOKEN = await question('Access Token de MP: ') || '';
    config.MP_PUBLIC_KEY = await question('Public Key de MP: ') || '';

    // Email (opcional)
    console.log('\n📧 EMAIL - RESEND (opcional, presiona Enter para omitir)');
    config.RESEND_API_KEY = await question('API Key de Resend: ') || '';

    // WhatsApp (opcional)
    console.log('\n📱 WHATSAPP - TWILIO (opcional, presiona Enter para omitir)');
    config.TWILIO_ACCOUNT_SID = await question('Account SID de Twilio: ') || '';
    config.TWILIO_AUTH_TOKEN = await question('Auth Token de Twilio: ') || '';
    config.TWILIO_WHATSAPP_FROM = await question('Número WhatsApp (ej: whatsapp:+14155238886): ') || 'whatsapp:+14155238886';

    // URLs
    console.log('\n🌐 URLs DEL SITIO');
    const usarLocal = await question('¿Usar localhost para desarrollo? (s/n): ');
    if (usarLocal.toLowerCase() === 's') {
        config.CLIENT_URL = 'http://localhost:3000';
        config.WEBHOOK_BASE_URL = 'http://localhost:3000';
    } else {
        config.CLIENT_URL = await question('URL del cliente (ej: https://tudominio.com): ');
        config.WEBHOOK_BASE_URL = await question('URL del webhook (ej: https://tudominio.com): ');
    }

    config.SUCCESS_URL = `${config.CLIENT_URL}/pago-exitoso.html`;
    config.FAILURE_URL = `${config.CLIENT_URL}/pago-fallido.html`;
    config.PENDING_URL = `${config.CLIENT_URL}/pago-pendiente.html`;

    // Puerto
    config.PORT = '3000';
    config.NODE_ENV = 'development';

    // Generar archivo .env
    console.log('\n📝 Generando archivo .env...');
    
    const envContent = `# Generado automáticamente por setup.js
# Fecha: ${new Date().toISOString()}

# Supabase
SUPABASE_URL=${config.SUPABASE_URL}
SUPABASE_ANON_KEY=${config.SUPABASE_ANON_KEY}
SUPABASE_SERVICE_KEY=${config.SUPABASE_SERVICE_KEY}

# Seguridad
JWT_SECRET=${config.JWT_SECRET}

# Mercado Pago
MP_ACCESS_TOKEN=${config.MP_ACCESS_TOKEN}
MP_PUBLIC_KEY=${config.MP_PUBLIC_KEY}
MP_WEBHOOK_SECRET=

# Email (Resend)
RESEND_API_KEY=${config.RESEND_API_KEY}

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=${config.TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=${config.TWILIO_AUTH_TOKEN}
TWILIO_WHATSAPP_FROM=${config.TWILIO_WHATSAPP_FROM}

# URLs
WEBHOOK_BASE_URL=${config.WEBHOOK_BASE_URL}
CLIENT_URL=${config.CLIENT_URL}
SUCCESS_URL=${config.SUCCESS_URL}
FAILURE_URL=${config.FAILURE_URL}
PENDING_URL=${config.PENDING_URL}

# Servidor
PORT=${config.PORT}
NODE_ENV=${config.NODE_ENV}
`;

    fs.writeFileSync(path.join(__dirname, '.env'), envContent);
    console.log('✅ Archivo .env creado correctamente');

    console.log('\n📋 PRÓXIMOS PASOS:\n');
    console.log('1. Ve a Supabase SQL Editor');
    console.log('2. Ejecuta el contenido de src/database/schema.sql');
    console.log('3. Ejecuta: npm run migrate (para crear usuario admin)');
    console.log('4. Ejecuta: npm run dev (para iniciar el servidor)');
    console.log('5. Accede a http://localhost:3000\n');

    console.log('🎉 ¡Configuración completada!\n');

    rl.close();
}

setup().catch(error => {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
});
