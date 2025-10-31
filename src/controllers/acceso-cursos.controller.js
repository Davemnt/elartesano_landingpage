import accesoService from '../services/acceso-cursos.service.js';
import { supabase } from '../config/supabase.js';

/**
 * Verificar token de acceso y devolver información del curso
 */
export const verificarAcceso = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                error: 'Token de acceso requerido'
            });
        }

        // Verificar el token
        const acceso = await accesoService.verificarTokenAcceso(token);

        if (!acceso) {
            return res.status(401).json({
                error: 'Token inválido o expirado'
            });
        }

        // Obtener información completa del curso
        const { data: curso, error: cursoError } = await supabase
            .from('cursos')
            .select(`
                *,
                curso_lecciones (
                    id,
                    titulo,
                    orden,
                    duracion_minutos
                )
            `)
            .eq('id', acceso.curso_id)
            .single();

        if (cursoError) {
            console.error('Error al obtener curso:', cursoError);
            return res.status(500).json({
                error: 'Error al cargar el curso'
            });
        }

        // Ordenar lecciones por orden
        if (curso.curso_lecciones) {
            curso.curso_lecciones.sort((a, b) => a.orden - b.orden);
        }

        res.json({
            success: true,
            email: acceso.email,
            curso: {
                id: curso.id,
                titulo: curso.titulo,
                descripcion: curso.descripcion,
                imagen_url: curso.imagen_url,
                nivel: curso.nivel,
                duracion_horas: curso.duracion_horas,
                lecciones: curso.curso_lecciones || []
            },
            progreso: acceso.progreso,
            completado: acceso.completado,
            expira_en: acceso.expira_en,
            ultimo_acceso: acceso.ultimo_acceso
        });

    } catch (error) {
        console.error('Error en verificarAcceso:', error);
        res.status(500).json({
            error: 'Error al verificar el acceso'
        });
    }
};

/**
 * Obtener lección específica con validación de acceso
 */
export const obtenerLeccion = async (req, res) => {
    try {
        const { token, leccionId } = req.query;

        if (!token || !leccionId) {
            return res.status(400).json({
                error: 'Token y leccionId son requeridos'
            });
        }

        // Verificar acceso
        const acceso = await accesoService.verificarTokenAcceso(token);

        if (!acceso) {
            return res.status(401).json({
                error: 'Token inválido o expirado'
            });
        }

        // Obtener la lección
        const { data: leccion, error: leccionError } = await supabase
            .from('curso_lecciones')
            .select('*')
            .eq('id', leccionId)
            .eq('curso_id', acceso.curso_id)
            .single();

        if (leccionError || !leccion) {
            return res.status(404).json({
                error: 'Lección no encontrada'
            });
        }

        res.json({
            success: true,
            leccion
        });

    } catch (error) {
        console.error('Error en obtenerLeccion:', error);
        res.status(500).json({
            error: 'Error al cargar la lección'
        });
    }
};

/**
 * Actualizar progreso del curso
 */
export const actualizarProgreso = async (req, res) => {
    try {
        const { token, progreso, completado } = req.body;

        if (!token || progreso === undefined) {
            return res.status(400).json({
                error: 'Token y progreso son requeridos'
            });
        }

        // Verificar acceso
        const acceso = await accesoService.verificarTokenAcceso(token);

        if (!acceso) {
            return res.status(401).json({
                error: 'Token inválido o expirado'
            });
        }

        // Actualizar progreso
        const { data, error } = await supabase
            .from('accesos_cursos')
            .update({
                progreso: Math.min(100, Math.max(0, progreso)),
                completado: completado === true || progreso >= 100,
                ultimo_acceso: new Date().toISOString()
            })
            .eq('token_acceso', token)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar progreso:', error);
            return res.status(500).json({
                error: 'Error al actualizar el progreso'
            });
        }

        res.json({
            success: true,
            progreso: data.progreso,
            completado: data.completado
        });

    } catch (error) {
        console.error('Error en actualizarProgreso:', error);
        res.status(500).json({
            error: 'Error al actualizar el progreso'
        });
    }
};

/**
 * Obtener todos los cursos de un email
 */
export const obtenerMisCursos = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                error: 'Email requerido'
            });
        }

        const cursos = await accesoService.obtenerCursosPorEmail(email);

        res.json({
            success: true,
            cursos
        });

    } catch (error) {
        console.error('Error en obtenerMisCursos:', error);
        res.status(500).json({
            error: 'Error al obtener los cursos'
        });
    }
};
