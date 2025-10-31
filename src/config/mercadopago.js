import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MP_ACCESS_TOKEN) {
    console.warn('⚠️ MP_ACCESS_TOKEN no configurado. Mercado Pago no funcionará.');
}

// Configurar cliente de Mercado Pago (SDK v2)
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || '',
    options: { timeout: 5000 }
});

// Exportar instancias configuradas
export const payment = new Payment(client);
export const preference = new Preference(client);
export default client;
