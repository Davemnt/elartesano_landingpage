import express from 'express';
import { crearOrden, obtenerOrden, misOrdenes, listarOrdenesAdmin, actualizarEstadoOrden, confirmarPagoManual } from '../controllers/ordenes.controller.js';
import { verificarAuth } from '../middleware/auth.js';
import verificarAdmin from '../middleware/admin.js';

const router = express.Router();

// Crear orden (public - si el usuario no está logueado se puede crear igualmente)
router.post('/', crearOrden);

// Obtener orden por id (temporalmente sin auth para admin)
router.get('/:id', obtenerOrden);

// Mis órdenes (usuario autenticado)
router.get('/mis-ordenes', verificarAuth, misOrdenes);

// Admin: listar todas las órdenes (temporalmente sin auth para desarrollo)
router.get('/admin/all', listarOrdenesAdmin);

// Actualizar estado (permite notas_pago y comprobante_url)
router.patch('/:id/estado', actualizarEstadoOrden);

// Admin: confirmar pago manual (temporalmente sin auth para desarrollo)
router.post('/:id/confirmar-pago', confirmarPagoManual);

export default router;
