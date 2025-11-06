import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar almacenamiento de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Crear directorio de uploads si no existe
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: fileFilter
});

// Middleware para subir una sola imagen
export const uploadSingle = upload.single('imagen');

// Controlador para subir imagen
export const uploadImagen = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: true,
                mensaje: 'No se proporcionó ningún archivo'
            });
        }

        // Construir URL del archivo
        const fileUrl = `/uploads/${req.file.filename}`;
        
        console.log('📁 Imagen subida correctamente:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            size: req.file.size,
            url: fileUrl
        });

        res.json({
            error: false,
            mensaje: 'Imagen subida correctamente',
            data: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                size: req.file.size,
                url: fileUrl,
                fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`
            }
        });

    } catch (error) {
        console.error('❌ Error al subir imagen:', error);
        res.status(500).json({
            error: true,
            mensaje: 'Error interno del servidor',
            detalles: error.message
        });
    }
};

// Controlador para eliminar imagen
export const eliminarImagen = async (req, res) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                error: true,
                mensaje: 'Nombre de archivo requerido'
            });
        }

        const filePath = path.join(__dirname, '../../uploads', filename);
        
        // Verificar si el archivo existe
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: true,
                mensaje: 'Archivo no encontrado'
            });
        }

        // Eliminar archivo
        fs.unlinkSync(filePath);
        
        console.log('🗑️ Imagen eliminada:', filename);

        res.json({
            error: false,
            mensaje: 'Imagen eliminada correctamente'
        });

    } catch (error) {
        console.error('❌ Error al eliminar imagen:', error);
        res.status(500).json({
            error: true,
            mensaje: 'Error interno del servidor',
            detalles: error.message
        });
    }
};

// Controlador para listar imágenes
export const listarImagenes = async (req, res) => {
    try {
        const uploadDir = path.join(__dirname, '../../uploads');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
            return res.json({
                error: false,
                mensaje: 'Directorio de uploads creado',
                data: []
            });
        }

        // Leer archivos del directorio
        const files = fs.readdirSync(uploadDir);
        
        // Filtrar solo imágenes y obtener información
        const imageFiles = files
            .filter(file => {
                const ext = path.extname(file).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
            })
            .map(file => {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    url: `/uploads/${file}`,
                    fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file}`,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.created) - new Date(a.created)); // Más recientes primero

        res.json({
            error: false,
            mensaje: `${imageFiles.length} imágenes encontradas`,
            data: imageFiles
        });

    } catch (error) {
        console.error('❌ Error al listar imágenes:', error);
        res.status(500).json({
            error: true,
            mensaje: 'Error interno del servidor',
            detalles: error.message
        });
    }
};