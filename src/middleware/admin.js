/**
 * Middleware para verificar que el usuario sea administrador
 */
export const verificarAdmin = (req, res, next) => {
    try {
        // Verificar que haya usuario autenticado
        if (!req.usuario) {
            return res.status(401).json({
                success: false,
                message: 'Debe estar autenticado'
            });
        }
        
        // Verificar rol de administrador
        if (req.usuario.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos de administrador'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al verificar permisos de administrador',
            error: error.message
        });
    }
};

export default verificarAdmin;
