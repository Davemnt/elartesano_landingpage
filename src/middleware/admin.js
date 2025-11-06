/**
 * Middleware para verificar que el usuario sea administrador
 */
export const verificarAdmin = (req, res, next) => {
    try {
        // Para desarrollo local, verificar contraseña simple
        const authHeader = req.headers.authorization;
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: true,
                mensaje: 'Token de autorización requerido'
            });
        }
        
        const token = authHeader.split(' ')[1];
        
        // Verificación simple para desarrollo
        if (token !== adminPassword) {
            return res.status(403).json({
                error: true,
                mensaje: 'Credenciales de administrador inválidas'
            });
        }
        
        // Agregar información de admin al request
        req.admin = { 
            role: 'admin',
            authenticated: true 
        };
        
        next();
    } catch (error) {
        console.error('❌ Error en middleware admin:', error);
        return res.status(500).json({
            error: true,
            mensaje: 'Error al verificar permisos de administrador',
            detalles: error.message
        });
    }
};

export default verificarAdmin;
