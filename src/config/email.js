import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

let resend = null;

if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
    try {
        resend = new Resend(process.env.RESEND_API_KEY);
        console.log('✅ Resend (Email) configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar Resend:', error.message);
    }
} else {
    console.warn('⚠️ RESEND_API_KEY no configurado o inválido. Los emails no se enviarán.');
}

export default resend;
