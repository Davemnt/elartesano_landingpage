import { supabaseAdmin } from '../config/supabase.js';

// Cursos de ejemplo para cuando Supabase no esté configurado
const cursosEjemplo = [
    {
        id: '1',
        titulo: 'Panadería Básica - Primeros Pasos',
        descripcion: 'Aprende los fundamentos de la panadería artesanal desde cero. Masa madre, fermentación y técnicas básicas.',
        precio: 2500,
        duracion_horas: 8,
        nivel: 'Principiante',
        imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
        activo: true,
        destacado: true,
        contenido: [
            { titulo: 'Introducción a la Panadería', duracion: '30 min' },
            { titulo: 'Masa Madre - Creación y Mantenimiento', duracion: '45 min' },
            { titulo: 'Técnicas de Amasado', duracion: '60 min' },
            { titulo: 'Fermentación y Levado', duracion: '40 min' },
            { titulo: 'Horneado Perfecto', duracion: '35 min' }
        ]
    },
    {
        id: '2',
        titulo: 'Repostería Profesional',
        descripcion: 'Domina las técnicas de repostería fina: tortas, macarons, croissants y más.',
        precio: 3500,
        duracion_horas: 12,
        nivel: 'Intermedio',
        imagen_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
        activo: true,
        destacado: true,
        contenido: [
            { titulo: 'Introducción a la Repostería', duracion: '30 min' },
            { titulo: 'Bases y Cremas', duracion: '60 min' },
            { titulo: 'Decoración Profesional', duracion: '90 min' }
        ]
    },
    {
        id: '3',
        titulo: 'Masas Dulces y Facturas',
        descripcion: 'Secretos de las facturas artesanales: medialunas, vigilantes, bolas de fraile y más.',
        precio: 1800,
        duracion_horas: 6,
        nivel: 'Principiante',
        imagen_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
        activo: true,
        destacado: false,
        contenido: [
            { titulo: 'Tipos de Masas Dulces', duracion: '40 min' },
            { titulo: 'Laminado y Mantequillado', duracion: '50 min' }
        ]
    }
];

/**
 * Obtener todos los cursos activos
 */
export const obtenerCursos = async (req, res) => {
    try {
        console.log('📚 GET /api/cursos - Iniciando...');
        
        // Intentar obtener de Supabase
        const { data: cursos, error } = await supabaseAdmin
            .from('cursos')
            .select('*')
            .eq('activo', true)
            .order('fecha_creacion', { ascending: false });

        // Si hay error de conexión o Supabase no configurado, usar datos de ejemplo
        if (error) {
            console.warn('⚠️ Supabase no configurado, usando cursos de ejemplo');
            console.log('Error de Supabase:', error.message);
            console.log(`✅ Devolviendo ${cursosEjemplo.length} cursos de ejemplo`);
            return res.json({
                success: true,
                data: cursosEjemplo,
                total: cursosEjemplo.length,
                modo: 'ejemplo'
            });
        }

        console.log(`✅ Devolviendo ${cursos.length} cursos de Supabase`);
        res.json({
            success: true,
            data: cursos,
            total: cursos.length
        });
    } catch (error) {
        console.warn('⚠️ Error conectando a Supabase, usando cursos de ejemplo:', error.message);
        console.log(`✅ Devolviendo ${cursosEjemplo.length} cursos de ejemplo (catch)`);
        // En caso de error, devolver cursos de ejemplo
        res.json({
            success: true,
            data: cursosEjemplo,
            total: cursosEjemplo.length,
            modo: 'ejemplo'
        });
    }
};

/**
 * Obtener curso por ID
 */
export const obtenerCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: curso, error } = await supabaseAdmin
            .from('cursos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        res.json({
            success: true,
            data: curso
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener cursos del usuario autenticado
 */
export const obtenerMisCursos = async (req, res) => {
    try {
        const { data: misCursos, error } = await supabaseAdmin
            .from('usuarios_cursos')
            .select(`
                *,
                cursos (*)
            `)
            .eq('usuario_id', req.usuario.id)
            .eq('activo', true);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error obteniendo cursos',
                error: error.message
            });
        }

        res.json({
            success: true,
            data: misCursos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Crear nuevo curso (Admin)
 */
export const crearCurso = async (req, res) => {
    try {
        const { titulo, descripcion, precio, duracion_horas, nivel, imagen_url, activo, destacado, contenido } = req.body;

        if (!titulo || !precio || !descripcion || !duracion_horas) {
            return res.status(400).json({
                success: false,
                message: 'Faltan campos obligatorios: titulo, precio, descripcion, duracion_horas'
            });
        }

        const { data: curso, error } = await supabaseAdmin
            .from('cursos')
            .insert({
                titulo,
                descripcion,
                precio: parseFloat(precio),
                duracion_horas: parseFloat(duracion_horas),
                nivel: nivel || 'Principiante',
                imagen_url: imagen_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
                contenido: contenido || [],
                activo: activo !== false,
                destacado: destacado === true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creando curso:', error);
            return res.status(500).json({
                success: false,
                message: 'Error creando curso',
                error: error.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'Curso creado exitosamente',
            data: curso
        });
    } catch (error) {
        console.error('Error en crearCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualizar curso (Admin)
 */
export const actualizarCurso = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = {};

        // Solo actualizar campos que vienen en el request
        const camposPermitidos = ['titulo', 'descripcion', 'precio', 'duracion_horas', 'nivel', 'imagen_url', 'contenido', 'activo', 'destacado'];
        
        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                updates[campo] = req.body[campo];
            }
        });

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay campos para actualizar'
            });
        }

        const { data: curso, error } = await supabaseAdmin
            .from('cursos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error actualizando curso:', error);
            return res.status(500).json({
                success: false,
                message: 'Error actualizando curso',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Curso actualizado exitosamente',
            data: curso
        });
    } catch (error) {
        console.error('Error en actualizarCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Eliminar curso (Admin) - Soft delete
 */
export const eliminarCurso = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: curso, error } = await supabaseAdmin
            .from('cursos')
            .update({ activo: false })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error eliminando curso:', error);
            return res.status(500).json({
                success: false,
                message: 'Error eliminando curso',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Curso eliminado exitosamente',
            data: curso
        });
    } catch (error) {
        console.error('Error en eliminarCurso:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export default {
    obtenerCursos,
    obtenerCurso,
    obtenerMisCursos,
    crearCurso,
    actualizarCurso,
    eliminarCurso
};
