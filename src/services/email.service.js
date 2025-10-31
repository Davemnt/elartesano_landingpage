import resend from '../config/email.js';
import { formatearPrecio } from '../utils/validators.js';

const EMAIL_FROM = process.env.EMAIL_FROM || 'El Artesano <pedidos@elartesano.com>';

/**
 * Enviar email de confirmación de pedido al cliente
 */
export const enviarEmailConfirmacionPedido = async (orden, items) => {
    try {
        const itemsHTML = items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.producto_nombre}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.cantidad}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatearPrecio(item.precio_unitario)}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${formatearPrecio(item.subtotal)}</td>
            </tr>
        `).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🥖 El Artesano</h1>
            <p style="margin: 10px 0 0; color: #F5E6D3; font-size: 16px;">Panadería Artesanal</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 5px; color: #2e7d32; font-size: 24px;">✅ ¡Pedido Confirmado!</h2>
                <p style="margin: 0; color: #1b5e20;">Tu pedido ha sido recibido y está siendo procesado</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola <strong>${orden.cliente_nombre}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Gracias por tu compra en El Artesano. Hemos recibido tu pedido y ya estamos preparándolo con mucho cariño.
            </p>
            
            <!-- Detalles del Pedido -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin: 0 0 15px; color: #8B4513; font-size: 18px;">📋 Detalles del Pedido</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #D4A574; color: #2C1810;">
                        <th style="padding: 12px; text-align: left;">Producto</th>
                        <th style="padding: 12px; text-align: center;">Cant.</th>
                        <th style="padding: 12px; text-align: right;">Precio</th>
                        <th style="padding: 12px; text-align: right;">Subtotal</th>
                    </tr>
                    ${itemsHTML}
                </table>
                
                <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #D4A574;">
                    <table style="width: 100%;">
                        <tr>
                            <td style="padding: 5px; text-align: right; color: #666;">Subtotal:</td>
                            <td style="padding: 5px; text-align: right; font-weight: bold; width: 100px;">${formatearPrecio(orden.subtotal)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px; text-align: right; color: #666;">Envío:</td>
                            <td style="padding: 5px; text-align: right; font-weight: bold;">${formatearPrecio(orden.costo_envio)}</td>
                        </tr>
                        <tr style="background-color: #FFF8E1;">
                            <td style="padding: 10px; text-align: right; font-size: 18px; color: #8B4513;"><strong>TOTAL:</strong></td>
                            <td style="padding: 10px; text-align: right; font-size: 20px; color: #8B4513; font-weight: bold;">${formatearPrecio(orden.total)}</td>
                        </tr>
                    </table>
                </div>
            </div>
            
            <!-- Info de Entrega -->
            <div style="background-color: #E3F2FD; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 15px; color: #1976D2; font-size: 18px;">🚚 Información de Entrega</h3>
                <p style="margin: 5px 0; color: #333;"><strong>Número de Pedido:</strong> ${orden.numero_orden}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Dirección:</strong> ${orden.direccion_entrega}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Ciudad:</strong> ${orden.ciudad} (${orden.codigo_postal})</p>
                <p style="margin: 5px 0; color: #333;"><strong>Teléfono:</strong> ${orden.cliente_telefono}</p>
                <p style="margin: 5px 0; color: #333;"><strong>Método de Pago:</strong> ${orden.metodo_pago}</p>
                ${orden.notas ? `<p style="margin: 5px 0; color: #666;"><strong>Notas:</strong> ${orden.notas}</p>` : ''}
            </div>
            
            <!-- Tiempo estimado -->
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #666; font-size: 14px; margin: 0 0 10px;">⏱️ <strong>Tiempo estimado de preparación:</strong></p>
                <p style="color: #8B4513; font-size: 24px; font-weight: bold; margin: 0;">24-48 horas</p>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5500'}/mi-cuenta.html" 
                   style="display: inline-block; background-color: #D4A574; color: #2C1810; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    Ver Mi Pedido
                </a>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px;">
                Si tienes alguna consulta sobre tu pedido, no dudes en contactarnos por WhatsApp o email.
                Te responderemos a la brevedad.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2C1810; color: #F5E6D3; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold;">🥖 El Artesano</p>
            <p style="margin: 0 0 5px; font-size: 14px;">Av. Vélez Sarsfield 28, Villa Madero</p>
            <p style="margin: 0 0 15px; font-size: 14px;">Provincia de Buenos Aires</p>
            <p style="margin: 0; font-size: 12px;">
                <a href="tel:+5491112345678" style="color: #D4A574; text-decoration: none;">+54 9 11 1234-5678</a> | 
                <a href="mailto:pedidos@elartesano.com" style="color: #D4A574; text-decoration: none;">pedidos@elartesano.com</a>
            </p>
            <div style="margin-top: 20px;">
                <a href="#" style="color: #D4A574; margin: 0 10px; text-decoration: none;">Facebook</a>
                <a href="#" style="color: #D4A574; margin: 0 10px; text-decoration: none;">Instagram</a>
                <a href="#" style="color: #D4A574; margin: 0 10px; text-decoration: none;">WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: orden.cliente_email,
            subject: `✅ Pedido ${orden.numero_orden} Confirmado - El Artesano`,
            html
        });

        console.log('✅ Email enviado al cliente:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email al cliente:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de nuevo pedido al administrador
 */
export const enviarEmailNuevoPedidoAdmin = async (orden, items) => {
    try {
        const itemsHTML = items.map(item => `
            <li style="margin-bottom: 10px;">
                <strong>${item.producto_nombre}</strong> x${item.cantidad} 
                = ${formatearPrecio(item.subtotal)}
            </li>
        `).join('');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden;">
        <div style="background: #8B4513; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0;">🔔 Nuevo Pedido Recibido</h1>
        </div>
        
        <div style="padding: 30px;">
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #856404;">⚡ Acción Requerida</h2>
                <p style="margin: 5px 0 0; color: #856404;">Nuevo pedido para preparar</p>
            </div>
            
            <h3 style="color: #8B4513;">📋 Información del Pedido</h3>
            <p><strong>Número:</strong> ${orden.numero_orden}</p>
            <p><strong>Total:</strong> ${formatearPrecio(orden.total)}</p>
            <p><strong>Método de Pago:</strong> ${orden.metodo_pago}</p>
            
            <h3 style="color: #8B4513;">👤 Datos del Cliente</h3>
            <p><strong>Nombre:</strong> ${orden.cliente_nombre}</p>
            <p><strong>Email:</strong> ${orden.cliente_email}</p>
            <p><strong>Teléfono:</strong> ${orden.cliente_telefono}</p>
            <p><strong>Dirección:</strong> ${orden.direccion_entrega}, ${orden.ciudad} (${orden.codigo_postal})</p>
            ${orden.notas ? `<p><strong>Notas:</strong> ${orden.notas}</p>` : ''}
            
            <h3 style="color: #8B4513;">🛒 Items a Preparar</h3>
            <ul style="background: #f9f9f9; padding: 20px; border-radius: 5px;">
                ${itemsHTML}
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5500'}/admin.html" 
                   style="display: inline-block; background: #D4A574; color: #2C1810; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Ver en Panel Admin
                </a>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: process.env.ADMIN_EMAIL || 'admin@elartesano.com',
            subject: `🔔 Nuevo Pedido ${orden.numero_orden} - ACCIÓN REQUERIDA`,
            html
        });

        console.log('✅ Email enviado al admin:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email al admin:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de acceso a curso (simplificado - solo email)
 */
export const enviarEmailAccesoCurso = async (email, { nombre_curso, link_acceso, cliente_nombre }) => {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🎓 El Artesano</h1>
            <p style="margin: 10px 0 0; color: #F5E6D3; font-size: 16px;">Academia de Panadería Artesanal</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 40px 30px;">
            <div style="background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 5px; color: #2e7d32; font-size: 24px;">🎉 ¡Tu Curso está Listo!</h2>
                <p style="margin: 0; color: #1b5e20;">Ya puedes comenzar a aprender</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola <strong>${cliente_nombre || 'Estudiante'}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ¡Gracias por tu compra! Tu pago ha sido confirmado y ahora tienes acceso completo a:
            </p>
            
            <!-- Info del Curso -->
            <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <h3 style="color: #8B4513; margin: 0 0 10px; font-size: 22px;">📚 ${nombre_curso}</h3>
                <p style="color: #666; margin: 15px 0; font-size: 14px;">
                    ✓ Acceso ilimitado<br>
                    ✓ A tu propio ritmo<br>
                    ✓ Certificado al completar
                </p>
            </div>
            
            <!-- Instrucciones -->
            <div style="background-color: #E3F2FD; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #1976D2; font-size: 18px;">🔑 Cómo acceder al curso:</h3>
                <ol style="color: #333; margin: 0; padding-left: 20px; line-height: 1.8;">
                    <li>Haz clic en el botón de abajo</li>
                    <li>Guarda este email para futuros accesos</li>
                    <li>¡Comienza a aprender!</li>
                </ol>
            </div>
            
            <!-- Botón de Acceso -->
            <div style="text-align: center; margin: 35px 0;">
                <a href="${link_acceso}" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4A574, #8B4513); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);">
                    🚀 Acceder al Curso
                </a>
            </div>
            
            <!-- Nota Importante -->
            <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 15px; margin: 25px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    <strong>📌 Importante:</strong> Guarda este email. El enlace te permitirá acceder al curso cuando quieras, sin necesidad de crear una cuenta.
                </p>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;">
                Si tienes alguna consulta, contáctanos por WhatsApp o email.<br>
                ¡Disfruta tu curso! 🎓
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #2C1810; color: #F5E6D3; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold;">🥖 El Artesano</p>
            <p style="margin: 0 0 5px; font-size: 14px;">Academia de Panadería Artesanal</p>
            <p style="margin: 0 0 15px; font-size: 14px;">Av. Vélez Sarsfield 28, Villa Madero, Buenos Aires</p>
            <p style="margin: 0; font-size: 12px;">
                <a href="tel:+5491112345678" style="color: #D4A574; text-decoration: none;">+54 9 11 1234-5678</a> | 
                <a href="mailto:cursos@elartesano.com" style="color: #D4A574; text-decoration: none;">cursos@elartesano.com</a>
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: email,
            subject: `🎓 Acceso Confirmado: ${nombre_curso} - El Artesano`,
            html
        });

        console.log('✅ Email de acceso a curso enviado a:', email);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email de curso:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Email para transferencia bancaria con datos bancarios
 */
export const enviarEmailTransferenciaPendiente = async (orden) => {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #D4A574 0%, #8B4513 100%); padding: 40px 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">🥖 El Artesano</h1>
            <p style="margin: 10px 0 0; color: #F5E6D3; font-size: 16px;">Panadería Artesanal</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <div style="background-color: #FFF8E1; border-left: 4px solid #FFC107; padding: 15px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 5px; color: #856404; font-size: 24px;">⏳ Transferencia Pendiente</h2>
                <p style="margin: 0; color: #856404;">Completa tu pago para procesar el pedido</p>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola <strong>${orden.cliente_nombre}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                Hemos recibido tu pedido <strong>${orden.numero_orden}</strong>. Para completar tu compra, realiza la transferencia bancaria por <strong>${formatearPrecio(orden.total)}</strong> a la siguiente cuenta:
            </p>
            
            <!-- Datos Bancarios -->
            <div style="background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 12px; padding: 25px; margin: 25px 0;">
                <h3 style="margin: 0 0 20px; color: #1976D2; text-align: center;">💳 Datos Bancarios</h3>
                
                <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Banco</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold;">Banco Galicia</p>
                </div>
                
                <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Titular</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold;">El Artesano Panadería</p>
                </div>
                
                <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">CUIT/CUIL</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold; font-family: monospace;">20-12345678-9</p>
                </div>
                
                <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 10px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">CBU</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold; font-family: monospace;">0070055520000012345678</p>
                </div>
                
                <div style="background: white; border-radius: 8px; padding: 12px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Alias</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 16px; font-weight: bold; font-family: monospace;">ARTESANO.PANADERIA</p>
                </div>
            </div>
            
            <!-- Monto -->
            <div style="background: #FFF3CD; border-radius: 12px; padding: 20px; text-align: center; margin: 25px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;">Monto a Transferir</p>
                <p style="margin: 10px 0 0; color: #8B4513; font-size: 32px; font-weight: bold;">${formatearPrecio(orden.total)}</p>
            </div>
            
            <!-- Instrucciones -->
            <div style="background-color: #E8F5E9; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #2E7D32; font-size: 18px;">📋 Pasos a seguir:</h3>
                <ol style="color: #333; margin: 0; padding-left: 20px; line-height: 2;">
                    <li>Realiza la transferencia por el monto exacto</li>
                    <li>Envíanos el comprobante por WhatsApp o email</li>
                    <li>En cuanto verifiquemos el pago, comenzaremos a preparar tu pedido</li>
                    <li>Te enviaremos un email de confirmación</li>
                </ol>
            </div>
            
            <!-- Link de Seguimiento -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/seguimiento.html?orden=${orden.id}" 
                   style="display: inline-block; background-color: #D4A574; color: #2C1810; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    📍 Seguir Mi Pedido
                </a>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;">
                Número de Pedido: <strong>${orden.numero_orden}</strong><br>
                ¿Necesitas ayuda? Contáctanos por WhatsApp: +54 9 11 1234-5678
            </p>
        </div>
        
        <div style="background-color: #2C1810; color: #F5E6D3; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold;">🥖 El Artesano</p>
            <p style="margin: 0 0 15px; font-size: 14px;">Av. Vélez Sarsfield 28, Villa Madero, Buenos Aires</p>
            <p style="margin: 0; font-size: 12px;">
                <a href="tel:+5491112345678" style="color: #D4A574; text-decoration: none;">+54 9 11 1234-5678</a> | 
                <a href="mailto:pedidos@elartesano.com" style="color: #D4A574; text-decoration: none;">pedidos@elartesano.com</a>
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: orden.cliente_email,
            subject: `💳 Datos para Transferencia - Pedido ${orden.numero_orden}`,
            html
        });

        console.log('✅ Email de transferencia enviado a:', orden.cliente_email);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email de transferencia:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Email cuando se confirma el pago
 */
export const enviarEmailPagoConfirmado = async (orden) => {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 15px;">✅</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">¡Pago Confirmado!</h1>
            <p style="margin: 10px 0 0; color: #E8F5E9; font-size: 16px;">Tu pedido está en preparación</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola <strong>${orden.cliente_nombre}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
                ¡Excelente noticia! Hemos confirmado tu pago y ya estamos preparando tu pedido con mucho cariño.
            </p>
            
            <!-- Estado del Pedido -->
            <div style="background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <h3 style="color: #2E7D32; margin: 0 0 15px; font-size: 22px;">📦 Estado del Pedido</h3>
                <div style="background: white; border-radius: 8px; padding: 15px; margin: 15px 0;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Número de Pedido</p>
                    <p style="margin: 5px 0 0; color: #333; font-size: 20px; font-weight: bold;">${orden.numero_orden}</p>
                </div>
                <div style="background: white; border-radius: 8px; padding: 15px;">
                    <p style="margin: 0; color: #666; font-size: 12px;">Estado</p>
                    <p style="margin: 5px 0 0; color: #2E7D32; font-size: 18px; font-weight: bold;">✅ Pago Confirmado - En Preparación</p>
                </div>
            </div>
            
            <!-- Próximos Pasos -->
            <div style="background-color: #E3F2FD; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #1976D2; font-size: 18px;">🚀 ¿Qué sigue?</h3>
                <ul style="color: #333; margin: 0; padding-left: 20px; line-height: 2;">
                    <li>Nuestro equipo está preparando tu pedido</li>
                    <li>Te notificaremos cuando esté listo para envío</li>
                    <li>Recibirás el número de seguimiento</li>
                    <li>Tiempo estimado: <strong>24-48 horas</strong></li>
                </ul>
            </div>
            
            <!-- Resumen de Compra -->
            <div style="background-color: #F5F5F5; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #8B4513; font-size: 18px;">💰 Resumen de Compra</h3>
                <table style="width: 100%;">
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Total Pagado:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 18px; color: #2E7D32;">${formatearPrecio(orden.total)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Método de Pago:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold;">${orden.metodo_pago === 'transferencia' ? '💳 Transferencia' : orden.metodo_pago === 'mercadopago' ? '💳 Mercado Pago' : '💵 Efectivo'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #666;">Dirección de Entrega:</td>
                        <td style="padding: 8px 0; text-align: right;">${orden.direccion_entrega}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Botón de Seguimiento -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/seguimiento.html?orden=${orden.id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #D4A574, #8B4513); color: #ffffff; padding: 18px 50px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);">
                    📍 Seguir Mi Pedido
                </a>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;">
                ¿Tienes alguna pregunta? Estamos aquí para ayudarte<br>
                WhatsApp: +54 9 11 1234-5678 | Email: pedidos@elartesano.com
            </p>
        </div>
        
        <div style="background-color: #2C1810; color: #F5E6D3; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold;">🥖 El Artesano</p>
            <p style="margin: 0 0 15px; font-size: 14px;">Av. Vélez Sarsfield 28, Villa Madero, Buenos Aires</p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: orden.cliente_email,
            subject: `✅ Pago Confirmado - Pedido ${orden.numero_orden} en Preparación`,
            html
        });

        console.log('✅ Email de pago confirmado enviado a:', orden.cliente_email);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email de pago confirmado:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Email de actualización de estado (enviado, entregado)
 */
export const enviarEmailActualizacionEstado = async (orden, nuevoEstado) => {
    const estados = {
        'preparacion': { emoji: '👨‍🍳', titulo: 'Preparando tu Pedido', color: '#FF9800', mensaje: 'Nuestro equipo está horneando tus productos frescos' },
        'enviado': { emoji: '🚚', titulo: 'Pedido en Camino', color: '#2196F3', mensaje: 'Tu pedido está en camino hacia tu domicilio' },
        'entregado': { emoji: '✅', titulo: 'Pedido Entregado', color: '#4CAF50', mensaje: '¡Disfruta tus productos artesanales!' }
    };

    const estado = estados[nuevoEstado] || { emoji: '📦', titulo: 'Actualización de Pedido', color: '#9E9E9E', mensaje: 'Tu pedido ha sido actualizado' };

    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, ${estado.color} 0%, ${estado.color}DD 100%); padding: 40px 20px; text-align: center;">
            <div style="font-size: 64px; margin-bottom: 15px;">${estado.emoji}</div>
            <h1 style="margin: 0; color: #ffffff; font-size: 32px;">${estado.titulo}</h1>
            <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">Pedido ${orden.numero_orden}</p>
        </div>
        
        <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola <strong>${orden.cliente_nombre}</strong>,</p>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">${estado.mensaje}</p>
            
            ${nuevoEstado === 'enviado' ? `
            <div style="background-color: #E3F2FD; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px; color: #1976D2; font-size: 18px;">📍 Información de Envío</h3>
                <p style="margin: 0; color: #333; line-height: 1.8;">
                    <strong>Dirección:</strong> ${orden.direccion_entrega}<br>
                    <strong>Ciudad:</strong> ${orden.ciudad}<br>
                    <strong>Código Postal:</strong> ${orden.codigo_postal}<br>
                    <strong>Teléfono de Contacto:</strong> ${orden.cliente_telefono}
                </p>
            </div>
            ` : ''}
            
            ${nuevoEstado === 'entregado' ? `
            <div style="background: linear-gradient(135deg, #FFF8E1 0%, #FFE0B2 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
                <h3 style="color: #8B4513; margin: 0 0 15px; font-size: 22px;">⭐ ¿Qué tal tu experiencia?</h3>
                <p style="color: #666; margin: 0 0 20px;">Nos encantaría conocer tu opinión</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/valoracion.html?orden=${orden.id}" 
                   style="display: inline-block; background-color: #D4A574; color: #2C1810; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                    Dejar una Reseña
                </a>
            </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/seguimiento.html?orden=${orden.id}" 
                   style="display: inline-block; background-color: #D4A574; color: #2C1810; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">
                    Ver Estado del Pedido
                </a>
            </div>
            
            <p style="color: #999; font-size: 13px; line-height: 1.6; margin-top: 30px; text-align: center;">
                ¿Necesitas ayuda? Contáctanos<br>
                WhatsApp: +54 9 11 1234-5678
            </p>
        </div>
        
        <div style="background-color: #2C1810; color: #F5E6D3; padding: 30px; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 18px; font-weight: bold;">🥖 El Artesano</p>
            <p style="margin: 0 0 15px; font-size: 14px;">Av. Vélez Sarsfield 28, Villa Madero, Buenos Aires</p>
        </div>
    </div>
</body>
</html>
        `;

        const result = await resend.emails.send({
            from: EMAIL_FROM,
            to: orden.cliente_email,
            subject: `${estado.emoji} ${estado.titulo} - Pedido ${orden.numero_orden}`,
            html
        });

        console.log('✅ Email de actualización de estado enviado:', nuevoEstado);
        return { success: true, data: result };
    } catch (error) {
        console.error('❌ Error enviando email de actualización:', error);
        return { success: false, error: error.message };
    }
};

export default {
    enviarEmailConfirmacionPedido,
    enviarEmailNuevoPedidoAdmin,
    enviarEmailAccesoCurso,
    enviarEmailTransferenciaPendiente,
    enviarEmailPagoConfirmado,
    enviarEmailActualizacionEstado
};
