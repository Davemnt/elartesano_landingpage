import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para ejecutar migraciones de base de datos
 */
async function migrate() {
    try {
        console.log('🚀 Iniciando migración de base de datos...\n');

        // Leer el archivo SQL
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSQLContent = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Archivo schema.sql leído correctamente');
        console.log('⚠️  IMPORTANTE: Debes ejecutar el SQL manualmente en Supabase SQL Editor');
        console.log('📍 Ubicación del archivo:', schemaPath);
        console.log('\n' + '='.repeat(60));
        console.log('INSTRUCCIONES:');
        console.log('='.repeat(60));
        console.log('1. Ve a tu proyecto de Supabase');
        console.log('2. Abre SQL Editor');
        console.log('3. Copia y pega el contenido de schema.sql');
        console.log('4. Ejecuta el script');
        console.log('='.repeat(60) + '\n');

        // Crear usuario admin con bcrypt
        console.log('👤 Creando usuario administrador...');
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@elartesano.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // Verificar si el usuario admin ya existe
        const { data: existingAdmin } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', adminEmail)
            .single();

        if (existingAdmin) {
            console.log('ℹ️  Usuario admin ya existe, actualizando...');
            
            const { error } = await supabaseAdmin
                .from('usuarios')
                .update({
                    password_hash: passwordHash,
                    nombre: 'Administrador',
                    telefono: '+5491112345678',
                    rol: 'admin',
                    activo: true
                })
                .eq('email', adminEmail);

            if (error) {
                console.error('❌ Error actualizando admin:', error);
            } else {
                console.log('✅ Usuario admin actualizado correctamente');
            }
        } else {
            const { error } = await supabaseAdmin
                .from('usuarios')
                .insert({
                    email: adminEmail,
                    password_hash: passwordHash,
                    nombre: 'Administrador',
                    telefono: '+5491112345678',
                    rol: 'admin',
                    activo: true
                });

            if (error) {
                console.error('❌ Error creando admin:', error);
            } else {
                console.log('✅ Usuario admin creado correctamente');
            }
        }

        console.log('\n📊 Credenciales de Admin:');
        console.log('  Email:', adminEmail);
        console.log('  Password:', adminPassword);
        console.log('  ⚠️  CAMBIAR PASSWORD EN PRODUCCIÓN\n');

        console.log('✅ Migración completada exitosamente!\n');
        console.log('📝 Próximos pasos:');
        console.log('  1. Ejecuta el schema.sql en Supabase SQL Editor');
        console.log('  2. Configura las variables de entorno (.env)');
        console.log('  3. Inicia el servidor: npm run dev');
        console.log('  4. Prueba el login admin con las credenciales arriba\n');

    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
}

// Ejecutar migración
migrate();
