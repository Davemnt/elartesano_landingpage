/**
 * Validadores de datos
 */

/**
 * Validar email
 */
export const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

/**
 * Validar contraseña
 * Mínimo 6 caracteres, al menos una mayúscula, una minúscula y un número
 */
export const validarPassword = (password) => {
    if (password.length < 6) {
        return { valido: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    
    if (!/[A-Z]/.test(password)) {
        return { valido: false, mensaje: 'La contraseña debe tener al menos una mayúscula' };
    }
    
    if (!/[a-z]/.test(password)) {
        return { valido: false, mensaje: 'La contraseña debe tener al menos una minúscula' };
    }
    
    if (!/[0-9]/.test(password)) {
        return { valido: false, mensaje: 'La contraseña debe tener al menos un número' };
    }
    
    return { valido: true };
};

/**
 * Validar teléfono argentino
 */
export const validarTelefono = (telefono) => {
    // Formato: +549XXXXXXXXXX o 11XXXXXXXX
    const regex = /^(\+549)?[0-9]{10,11}$/;
    return regex.test(telefono.replace(/[\s-]/g, ''));
};

/**
 * Validar precio
 */
export const validarPrecio = (precio) => {
    const num = parseFloat(precio);
    return !isNaN(num) && num >= 0;
};

/**
 * Validar cantidad
 */
export const validarCantidad = (cantidad) => {
    const num = parseInt(cantidad);
    return Number.isInteger(num) && num > 0;
};

/**
 * Sanitizar string (prevenir XSS)
 */
export const sanitizarString = (str) => {
    if (typeof str !== 'string') return '';
    
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Validar UUID
 */
export const validarUUID = (uuid) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
};

/**
 * Formatear teléfono para WhatsApp
 */
export const formatearTelefonoWhatsApp = (telefono) => {
    // Remover todo excepto números
    let num = telefono.replace(/\D/g, '');
    
    // Si empieza con 54, remover
    if (num.startsWith('54')) {
        num = num.substring(2);
    }
    
    // Si empieza con 9, remover
    if (num.startsWith('9')) {
        num = num.substring(1);
    }
    
    // Agregar código de país
    return `whatsapp:+549${num}`;
};

/**
 * Formatear precio (ARS)
 */
export const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(precio);
};

/**
 * Generar slug desde texto
 */
export const generarSlug = (texto) => {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
        .trim()
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/-+/g, '-'); // Remover guiones duplicados
};

export default {
    validarEmail,
    validarPassword,
    validarTelefono,
    validarPrecio,
    validarCantidad,
    sanitizarString,
    validarUUID,
    formatearTelefonoWhatsApp,
    formatearPrecio,
    generarSlug
};
