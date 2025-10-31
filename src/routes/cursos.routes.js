import express from 'express';
import { verificarAuth } from '../middleware/auth.js';
import {
    obtenerCursos,
    obtenerCurso,
    obtenerMisCursos
} from '../controllers/cursos.controller.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerCursos);
router.get('/:id', obtenerCurso);

// Rutas privadas
router.get('/mis-cursos', verificarAuth, obtenerMisCursos);

export default router;
