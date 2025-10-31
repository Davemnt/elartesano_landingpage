import express from 'express';
import {
    verificarAcceso,
    obtenerLeccion,
    actualizarProgreso,
    obtenerMisCursos
} from '../controllers/acceso-cursos.controller.js';

const router = express.Router();

/**
 * @route   POST /api/cursos/acceder
 * @desc    Verificar token de acceso y obtener datos del curso
 * @access  Public
 */
router.post('/acceder', verificarAcceso);

/**
 * @route   GET /api/cursos/leccion
 * @desc    Obtener lección específica (requiere token válido)
 * @access  Public (con token)
 */
router.get('/leccion', obtenerLeccion);

/**
 * @route   PUT /api/cursos/progreso
 * @desc    Actualizar progreso del curso
 * @access  Public (con token)
 */
router.put('/progreso', actualizarProgreso);

/**
 * @route   GET /api/cursos/mis-cursos
 * @desc    Obtener todos los cursos de un email
 * @access  Public
 */
router.get('/mis-cursos', obtenerMisCursos);

export default router;
