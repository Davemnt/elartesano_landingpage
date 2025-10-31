import { verificarToken } from '../utils/jwt.js';

/**
 * Middleware para verificar autenticación
 */
export const verificarAuth = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }
        
        const token = authHeader.substring(7); // Remover 'Bearer '
        
        // Verificar token
        const decoded = verificarToken(token);
        
        // Agregar usuario al request
        req.usuario = decoded;
        
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const verificarAuthOpcional = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verificarToken(token);
            req.usuario = decoded;
        }
        
        next();
    } catch (error) {
        // Continuar sin usuario
        next();
    }
};

export default {
    verificarAuth,
    verificarAuthOpcional
};
