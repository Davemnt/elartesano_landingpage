import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase = null;
let supabaseAdmin = null;

if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
    try {
        // Cliente con la key pública (para operaciones del lado del cliente)
        supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: true,
                    persistSession: false
                }
            }
        );
        console.log('✅ Supabase configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar Supabase:', error.message);
    }
} else {
    console.warn('⚠️ Variables de entorno de Supabase no configuradas. Base de datos no funcionará.');
}

// Cliente con la service key (para operaciones administrativas)
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY)) {
    try {
        supabaseAdmin = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        console.log('✅ Supabase Admin configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar Supabase Admin:', error.message);
    }
} else {
    console.warn('⚠️ Variables de entorno de Supabase Admin no configuradas.');
}

export { supabase, supabaseAdmin };
export default supabase;
