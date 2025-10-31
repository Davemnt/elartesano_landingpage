import express from 'express';
import { body } from 'express-validator';
import {
    registro,
    login,
    obtenerUsuarioActual,
    actualizarPerfil,
    cambiarPassword
} from '../controllers/auth.controller.js';
import { verificarAuth } from '../middleware/auth.js';
import manejarErroresValidacion from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/registro
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post(
    '/registro',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('telefono').optional().isMobilePhone('es-AR').withMessage('Teléfono inválido')
    ],
    manejarErroresValidacion,
    registro
);

/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Email inválido'),
        body('password').notEmpty().withMessage('La contraseña es requerida')
    ],
    manejarErroresValidacion,
    login
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener usuario actual
 * @access  Private
 */
router.get('/me', verificarAuth, obtenerUsuarioActual);

/**
 * @route   PUT /api/auth/perfil
 * @desc    Actualizar perfil de usuario
 * @access  Private
 */
router.put(
    '/perfil',
    verificarAuth,
    [
        body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('telefono').optional().isMobilePhone('es-AR').withMessage('Teléfono inválido')
    ],
    manejarErroresValidacion,
    actualizarPerfil
);

/**
 * @route   PUT /api/auth/cambiar-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put(
    '/cambiar-password',
    verificarAuth,
    [
        body('passwordActual').notEmpty().withMessage('La contraseña actual es requerida'),
        body('passwordNuevo').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    ],
    manejarErroresValidacion,
    cambiarPassword
);

export default router;
