import express from 'express';
import { uploadSingle, uploadImagen, eliminarImagen, listarImagenes } from '../controllers/upload.controller.js';
import { verificarAdmin } from '../middleware/admin.js';

const router = express.Router();

// Aplicar middleware de admin a todas las rutas
router.use(verificarAdmin);

// Rutas para manejo de imágenes
router.post('/imagen', uploadSingle, uploadImagen);
router.delete('/imagen/:filename', eliminarImagen);
router.get('/imagenes', listarImagenes);

export default router;