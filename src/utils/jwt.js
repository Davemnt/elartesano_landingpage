import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_este_secreto_en_produccion';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generar token JWT
 */
export const generarToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRE
    });
};

/**
 * Verificar token JWT
 */
export const verificarToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
};

/**
 * Decodificar token sin verificar (útil para debug)
 */
export const decodificarToken = (token) => {
    return jwt.decode(token);
};

export default {
    generarToken,
    verificarToken,
    decodificarToken
};
