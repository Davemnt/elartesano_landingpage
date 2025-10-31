import { validationResult } from 'express-validator';

/**
 * Middleware para manejar errores de validación
 */
export const manejarErroresValidacion = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(err => ({
                campo: err.path || err.param,
                mensaje: err.msg
            }))
        });
    }
    
    next();
};

export default manejarErroresValidacion;
