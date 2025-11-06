import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

// Función para cargar cursos creados desde archivo
function cargarCursosCreados() {
    try {
        const archivoPath = path.join(process.cwd(), 'src', 'data', 'cursos-creados.json');
        if (fs.existsSync(archivoPath)) {
            const data = fs.readFileSync(archivoPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️ Error cargando cursos creados:', error.message);
    }
    return [];
}

// Función para guardar cursos creados en archivo
function guardarCursosCreados(cursos) {
    try {
        const archivoPath = path.join(process.cwd(), 'src', 'data', 'cursos-creados.json');
        fs.writeFileSync(archivoPath, JSON.stringify(cursos, null, 2), 'utf8');
        console.log(`💾 Cursos guardados en archivo: ${cursos.length} items`);
    } catch (error) {
        console.error('❌ Error guardando cursos:', error.message);
    }
}

// Lista de cursos creados dinámicamente (persistente)
let cursosCreados = cargarCursosCreados();

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
            console.warn('⚠️ Error conectando a Supabase, usando cursos de ejemplo + creados');
            console.log('Error de Supabase:', error.message);
            
            // Combinar cursos de ejemplo con cursos creados dinámicamente
            const cursosRespuesta = [...cursosEjemplo, ...cursosCreados];
            
            console.log(`✅ Devolviendo ${cursosRespuesta.length} cursos (${cursosEjemplo.length} ejemplo + ${cursosCreados.length} creados)`);
            return res.json({
                success: true,
                data: cursosRespuesta,
                total: cursosRespuesta.length,
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
        console.warn('⚠️ Error conectando a Supabase, usando cursos de ejemplo + creados:', error.message);
        
        // Combinar cursos de ejemplo con cursos creados dinámicamente
        const cursosRespuesta = [...cursosEjemplo, ...cursosCreados];
        
        console.log(`✅ Devolviendo ${cursosRespuesta.length} cursos (${cursosEjemplo.length} ejemplo + ${cursosCreados.length} creados) (catch)`);
        
        // En caso de error, devolver cursos de ejemplo + creados
        res.json({
            success: true,
            data: cursosRespuesta,
            total: cursosRespuesta.length,
            modo: 'ejemplo_con_creados'
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

        console.log('📚 Creando curso:', { titulo, precio, duracion_horas, imagen_url });

        // Si tenemos Supabase configurado, usarlo
        if (supabaseAdmin) {
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
                throw new Error(error.message);
            }

            return res.status(201).json({
                success: true,
                message: 'Curso creado exitosamente',
                data: curso
            });
        }

        // Modo desarrollo sin base de datos - simular creación
        console.log('⚠️ Modo desarrollo: simulando creación de curso');
        
        const cursoSimulado = {
            id: Date.now(), // ID simulado
            titulo,
            descripcion,
            precio: parseFloat(precio),
            duracion_horas: parseFloat(duracion_horas),
            nivel: nivel || 'Principiante',
            imagen_url: imagen_url || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
            contenido: contenido || [],
            activo: activo !== false,
            destacado: destacado === true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Agregar a la lista de cursos creados
        cursosCreados.push(cursoSimulado);
        
        // Guardar en archivo para persistencia
        guardarCursosCreados(cursosCreados);

        console.log('✅ Curso simulado creado:', cursoSimulado);
        console.log(`📚 Total cursos en memoria: ${cursosCreados.length}`);

        res.status(201).json({
            success: true,
            message: 'Curso creado exitosamente (modo desarrollo)',
            data: cursoSimulado,
            nota: 'Este curso solo existe en memoria. Configura Supabase para persistencia real.'
        });

    } catch (error) {
        console.error('❌ Error en crearCurso:', error);
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

        // Si tenemos Supabase configurado, usarlo
        if (supabaseAdmin && supabaseAdmin.from) {
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

            return res.json({
                success: true,
                message: 'Curso actualizado exitosamente',
                data: curso
            });
        }

        // Modo desarrollo sin base de datos - actualizar en memoria y archivo
        console.log('⚠️ Modo desarrollo: actualizando curso en memoria');
        
        // Buscar el curso en los cursos creados
        const indiceCurso = cursosCreados.findIndex(c => c.id == id);
        
        if (indiceCurso === -1) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Actualizar el curso
        cursosCreados[indiceCurso] = {
            ...cursosCreados[indiceCurso],
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Guardar cambios en archivo
        guardarCursosCreados(cursosCreados);

        console.log('✅ Curso actualizado:', cursosCreados[indiceCurso]);

        res.json({
            success: true,
            message: 'Curso actualizado exitosamente',
            data: cursosCreados[indiceCurso]
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
