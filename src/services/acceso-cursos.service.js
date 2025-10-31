import { supabase, supabaseAdmin } from '../config/supabase.js';
import crypto from 'crypto';

/**
 * Generar token único de acceso al curso
 * @param {string} email - Email del comprador
 * @param {number} cursoId - ID del curso
 * @returns {string} Token único
 */
export const generarTokenAccesoCurso = (email, cursoId) => {
    const data = `${email}-${cursoId}-${Date.now()}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Crear acceso a curso sin registro
 * Se llama desde el webhook cuando se confirma el pago de un curso
 */
export const crearAccesoCurso = async (email, cursoId, ordenId) => {
    try {
        const token = generarTokenAccesoCurso(email, cursoId);
        const expiraEn = new Date();
        expiraEn.setFullYear(expiraEn.getFullYear() + 1); // Token válido por 1 año

        // Insertar en tabla de accesos
        const { data, error } = await supabaseAdmin
            .from('accesos_cursos')
            .insert({
                email: email.toLowerCase(),
                curso_id: cursoId,
                orden_id: ordenId,
                token_acceso: token,
                expira_en: expiraEn.toISOString(),
                activo: true
            })
            .select()
            .single();

        if (error) throw error;

        return {
            success: true,
            token,
            link_acceso: `${process.env.CLIENT_URL}/acceder-curso.html?token=${token}`
        };
    } catch (error) {
        console.error('Error creando acceso a curso:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Verificar token de acceso
 */
export const verificarTokenAcceso = async (token) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('accesos_cursos')
            .select(`
                *,
                cursos (*)
            `)
            .eq('token_acceso', token)
            .eq('activo', true)
            .single();

        if (error || !data) {
            return { valido: false, mensaje: 'Token inválido o expirado' };
        }

        // Verificar expiración
        if (new Date(data.expira_en) < new Date()) {
            return { valido: false, mensaje: 'El acceso ha expirado' };
        }

        // Actualizar último acceso
        await supabaseAdmin
            .from('accesos_cursos')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', data.id);

        return {
            valido: true,
            acceso: data,
            curso: data.cursos
        };
    } catch (error) {
        console.error('Error verificando token:', error);
        return { valido: false, mensaje: 'Error del servidor' };
    }
};

/**
 * Obtener cursos de un email (sin autenticación)
 */
export const obtenerCursosPorEmail = async (email) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('accesos_cursos')
            .select(`
                *,
                cursos (*)
            `)
            .eq('email', email.toLowerCase())
            .eq('activo', true)
            .gte('expira_en', new Date().toISOString());

        if (error) throw error;

        return {
            success: true,
            cursos: data.map(acceso => ({
                ...acceso.cursos,
                token_acceso: acceso.token_acceso,
                fecha_compra: acceso.created_at
            }))
        };
    } catch (error) {
        console.error('Error obteniendo cursos:', error);
        return { success: false, error: error.message };
    }
};

export default {
    generarTokenAccesoCurso,
    crearAccesoCurso,
    verificarTokenAcceso,
    obtenerCursosPorEmail
};
