import express from 'express';
import { 
    crearCurso, 
    actualizarCurso, 
    eliminarCurso 
} from '../controllers/cursos.controller.js';
import {
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/productos.controller.js';

const router = express.Router();

// ===================================
// RUTAS DE CURSOS (Admin)
// ===================================

/**
 * @route   POST /api/admin/cursos
 * @desc    Crear nuevo curso
 * @access  Admin
 */
router.post('/cursos', crearCurso);

/**
 * @route   PATCH /api/admin/cursos/:id
 * @desc    Actualizar curso
 * @access  Admin
 */
router.patch('/cursos/:id', actualizarCurso);

/**
 * @route   PUT /api/admin/cursos/:id
 * @desc    Actualizar curso completo
 * @access  Admin
 */
router.put('/cursos/:id', actualizarCurso);

/**
 * @route   DELETE /api/admin/cursos/:id
 * @desc    Eliminar curso (soft delete)
 * @access  Admin
 */
router.delete('/cursos/:id', eliminarCurso);

// ===================================
// RUTAS DE PRODUCTOS (Admin)
// ===================================

/**
 * @route   POST /api/admin/productos
 * @desc    Crear nuevo producto
 * @access  Admin
 */
router.post('/productos', crearProducto);

/**
 * @route   PATCH /api/admin/productos/:id
 * @desc    Actualizar producto
 * @access  Admin
 */
router.patch('/productos/:id', actualizarProducto);

/**
 * @route   PUT /api/admin/productos/:id
 * @desc    Actualizar producto completo
 * @access  Admin
 */
router.put('/productos/:id', actualizarProducto);

/**
 * @route   DELETE /api/admin/productos/:id
 * @desc    Eliminar producto (soft delete)
 * @access  Admin
 */
router.delete('/productos/:id', eliminarProducto);

// ===================================
// DASHBOARD
// ===================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Obtener estadísticas del dashboard
 * @access  Admin
 */
router.get('/dashboard', (req, res) => {
    // TODO: Implementar estadísticas reales
    res.json({
        success: true,
        data: {
            ordenes_totales: 45,
            ventas_totales: 12350,
            productos_activos: 28,
            clientes_totales: 156
        }
    });
});

export default router;
