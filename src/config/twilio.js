import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

let twilioClient = null;

if (process.env.TWILIO_ACCOUNT_SID && 
    process.env.TWILIO_AUTH_TOKEN && 
    process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    try {
        twilioClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        console.log('✅ Twilio configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar Twilio:', error.message);
    }
} else {
    console.warn('⚠️ Credenciales de Twilio no configuradas o inválidas. WhatsApp no funcionará.');
}

export default twilioClient;
