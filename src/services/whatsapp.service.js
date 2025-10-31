import twilioClient from '../config/twilio.js';
import { formatearTelefonoWhatsApp, formatearPrecio } from '../utils/validators.js';

const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || 'whatsapp:+5491112345678';

/**
 * Enviar WhatsApp de confirmación al cliente
 */
export const enviarWhatsAppConfirmacionCliente = async (orden) => {
    try {
        if (!twilioClient) {
            console.warn('⚠️ Twilio no configurado, WhatsApp no enviado');
            return { success: false, message: 'Twilio no configurado' };
        }

        const mensaje = `
🥖 *El Artesano - Pedido Confirmado*

¡Hola ${orden.cliente_nombre}! 

✅ Tu pedido #${orden.numero_orden} fue confirmado y está siendo preparado.

💰 *Total:* ${formatearPrecio(orden.total)}
📍 *Dirección:* ${orden.direccion_entrega}, ${orden.ciudad}
💳 *Pago:* ${orden.metodo_pago}

⏱️ Tiempo estimado de preparación: 24-48 horas.

Te avisaremos cuando esté listo para envío/retiro.

¡Gracias por tu compra! 🙏
        `.trim();

        const to = formatearTelefonoWhatsApp(orden.cliente_telefono);

        const result = await twilioClient.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to,
            body: mensaje
        });

        console.log('✅ WhatsApp enviado al cliente:', result.sid);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando WhatsApp al cliente:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar WhatsApp de nuevo pedido al admin
 */
export const enviarWhatsAppNuevoPedidoAdmin = async (orden, items) => {
    try {
        if (!twilioClient) {
            console.warn('⚠️ Twilio no configurado, WhatsApp no enviado');
            return { success: false, message: 'Twilio no configurado' };
        }

        const itemsTexto = items.map(item => 
            `• ${item.producto_nombre} x${item.cantidad} = ${formatearPrecio(item.subtotal)}`
        ).join('\n');

        const mensaje = `
🔔 *NUEVO PEDIDO RECIBIDO*

📋 *Pedido:* #${orden.numero_orden}
💰 *Total:* ${formatearPrecio(orden.total)}

👤 *Cliente:*
${orden.cliente_nombre}
📧 ${orden.cliente_email}
📞 ${orden.cliente_telefono}

📍 *Entrega:*
${orden.direccion_entrega}
${orden.ciudad}, ${orden.codigo_postal}

🛒 *Items:*
${itemsTexto}

💳 *Pago:* ${orden.metodo_pago}
${orden.notas ? `\n📝 *Notas:* ${orden.notas}` : ''}

⚡ ACCIÓN REQUERIDA: Preparar pedido
        `.trim();

        const result = await twilioClient.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to: ADMIN_WHATSAPP,
            body: mensaje
        });

        console.log('✅ WhatsApp enviado al admin:', result.sid);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando WhatsApp al admin:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación de cambio de estado de pedido
 */
export const enviarWhatsAppCambioEstado = async (orden, nuevoEstado) => {
    try {
        if (!twilioClient) {
            console.warn('⚠️ Twilio no configurado, WhatsApp no enviado');
            return { success: false, message: 'Twilio no configurado' };
        }

        const estadosMensajes = {
            preparacion: '👨‍🍳 Tu pedido está siendo preparado con mucho cariño',
            enviado: '🚚 Tu pedido está en camino',
            entregado: '✅ Tu pedido ha sido entregado. ¡Esperamos que lo disfrutes!',
            cancelado: '❌ Tu pedido ha sido cancelado. Contactanos para más información'
        };

        const mensaje = `
🥖 *El Artesano - Actualización de Pedido*

Hola ${orden.cliente_nombre},

📦 *Pedido:* #${orden.numero_orden}
📊 *Estado:* ${estadosMensajes[nuevoEstado] || nuevoEstado}

${nuevoEstado === 'entregado' ? '⭐ ¡Gracias por tu compra! Nos encantaría saber tu opinión.' : ''}

¿Consultas? Escríbenos por WhatsApp.
        `.trim();

        const to = formatearTelefonoWhatsApp(orden.cliente_telefono);

        const result = await twilioClient.messages.create({
            from: TWILIO_WHATSAPP_FROM,
            to,
            body: mensaje
        });

        console.log('✅ WhatsApp de cambio de estado enviado:', result.sid);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando WhatsApp de cambio de estado:', error);
        return { success: false, error: error.message };
    }
};

export default {
    enviarWhatsAppConfirmacionCliente,
    enviarWhatsAppNuevoPedidoAdmin,
    enviarWhatsAppCambioEstado
};
