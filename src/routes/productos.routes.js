import express from 'express';
import { verificarAuth } from '../middleware/auth.js';
import verificarAdmin from '../middleware/admin.js';
import {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/productos.controller.js';

const router = express.Router();

// Rutas públicas
router.get('/', obtenerProductos);
router.get('/:id', obtenerProducto);

// Rutas de administrador
router.post('/', verificarAuth, verificarAdmin, crearProducto);
router.put('/:id', verificarAuth, verificarAdmin, actualizarProducto);
router.delete('/:id', verificarAuth, verificarAdmin, eliminarProducto);

export default router;
