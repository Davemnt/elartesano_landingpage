import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase.js';
import { generarToken } from '../utils/jwt.js';
import { validarEmail, validarPassword } from '../utils/validators.js';

/**
 * Registro de nuevo usuario
 */
export const registro = async (req, res) => {
    try {
        const { email, password, nombre, telefono } = req.body;

        // Validaciones
        if (!email || !password || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'Email, password y nombre son requeridos'
            });
        }

        if (!validarEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido'
            });
        }

        const validacionPassword = validarPassword(password);
        if (!validacionPassword.valido) {
            return res.status(400).json({
                success: false,
                message: validacionPassword.mensaje
            });
        }

        // Verificar si el usuario ya existe
        const { data: usuarioExistente } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (usuarioExistente) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Hash de la contraseña
        const passwordHash = await bcrypt.hash(password, 10);

        // Crear usuario
        const { data: usuario, error } = await supabaseAdmin
            .from('usuarios')
            .insert({
                email,
                password_hash: passwordHash,
                nombre,
                telefono: telefono || null,
                rol: 'cliente',
                activo: true
            })
            .select('id, email, nombre, telefono, rol, fecha_registro')
            .single();

        if (error) {
            console.error('Error creando usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }

        // Generar token
        const token = generarToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        });

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    telefono: usuario.telefono,
                    rol: usuario.rol,
                    fecha_registro: usuario.fecha_registro
                },
                token
            }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Login de usuario
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y password son requeridos'
            });
        }

        // Buscar usuario
        const { data: usuario, error } = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !usuario) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(403).json({
                success: false,
                message: 'Usuario desactivado. Contacta al administrador'
            });
        }

        // Verificar contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        
        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar última sesión
        await supabaseAdmin
            .from('usuarios')
            .update({ ultima_sesion: new Date().toISOString() })
            .eq('id', usuario.id);

        // Generar token
        const token = generarToken({
            id: usuario.id,
            email: usuario.email,
            rol: usuario.rol
        });

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                usuario: {
                    id: usuario.id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    telefono: usuario.telefono,
                    rol: usuario.rol
                },
                token
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Obtener usuario actual
 */
export const obtenerUsuarioActual = async (req, res) => {
    try {
        const { data: usuario, error } = await supabaseAdmin
            .from('usuarios')
            .select('id, email, nombre, telefono, rol, fecha_registro, ultima_sesion')
            .eq('id', req.usuario.id)
            .single();

        if (error || !usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data: usuario
        });
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualizar perfil de usuario
 */
export const actualizarPerfil = async (req, res) => {
    try {
        const { nombre, telefono } = req.body;
        const updates = {};

        if (nombre) updates.nombre = nombre;
        if (telefono) updates.telefono = telefono;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No hay datos para actualizar'
            });
        }

        const { data: usuario, error } = await supabaseAdmin
            .from('usuarios')
            .update(updates)
            .eq('id', req.usuario.id)
            .select('id, email, nombre, telefono, rol')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error actualizando perfil',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: usuario
        });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Cambiar contraseña
 */
export const cambiarPassword = async (req, res) => {
    try {
        const { passwordActual, passwordNuevo } = req.body;

        if (!passwordActual || !passwordNuevo) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva son requeridas'
            });
        }

        // Validar nueva contraseña
        const validacion = validarPassword(passwordNuevo);
        if (!validacion.valido) {
            return res.status(400).json({
                success: false,
                message: validacion.mensaje
            });
        }

        // Obtener usuario
        const { data: usuario } = await supabaseAdmin
            .from('usuarios')
            .select('password_hash')
            .eq('id', req.usuario.id)
            .single();

        // Verificar contraseña actual
        const passwordValido = await bcrypt.compare(passwordActual, usuario.password_hash);
        
        if (!passwordValido) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hash de nueva contraseña
        const nuevoHash = await bcrypt.hash(passwordNuevo, 10);

        // Actualizar contraseña
        const { error } = await supabaseAdmin
            .from('usuarios')
            .update({ password_hash: nuevoHash })
            .eq('id', req.usuario.id);

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error actualizando contraseña',
                error: error.message
            });
        }

        res.json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export default {
    registro,
    login,
    obtenerUsuarioActual,
    actualizarPerfil,
    cambiarPassword
};
