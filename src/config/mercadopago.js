import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

let client = null;
let payment = null;
let preference = null;

if (process.env.MP_ACCESS_TOKEN && process.env.MP_ACCESS_TOKEN.trim() !== '') {
    try {
        // Configurar cliente de Mercado Pago (SDK v2)
        client = new MercadoPagoConfig({ 
            accessToken: process.env.MP_ACCESS_TOKEN,
            options: { timeout: 5000 }
        });
        
        // Exportar instancias configuradas
        payment = new Payment(client);
        preference = new Preference(client);
        
        console.log('✅ Mercado Pago configurado correctamente');
    } catch (error) {
        console.warn('⚠️ Error al configurar Mercado Pago:', error.message);
    }
} else {
    console.warn('⚠️ MP_ACCESS_TOKEN no configurado. Mercado Pago no funcionará.');
}

export { payment, preference };
export default client;
