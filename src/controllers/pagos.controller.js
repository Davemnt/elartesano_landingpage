import { preference, payment } from '../config/mercadopago.js';
import { supabaseAdmin } from '../config/supabase.js';
import { enviarEmailConfirmacionPedido, enviarEmailNuevoPedidoAdmin, enviarEmailAccesoCurso } from '../services/email.service.js';
import { enviarWhatsAppConfirmacionCliente, enviarWhatsAppNuevoPedidoAdmin } from '../services/whatsapp.service.js';
import accesoService from '../services/acceso-cursos.service.js';

const NOTIFICATION_URL = `${process.env.WEBHOOK_BASE_URL || 'http://localhost:3000'}/api/pagos/webhook`;
const BACK_URL_SUCCESS = process.env.SUCCESS_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-exitoso.html`;
const BACK_URL_FAILURE = process.env.FAILURE_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-fallido.html`;
const BACK_URL_PENDING = process.env.PENDING_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-pendiente.html`;

/**
 * Crear preferencia de Mercado Pago para una orden existente
 * Body: { orden_id, payer: { email, name, phone } }
 */
export const crearPreferencia = async (req, res) => {
    try {
        const { orden_id, payer } = req.body;
        if (!orden_id) return res.status(400).json({ success: false, message: 'orden_id es requerido' });

        // Obtener orden e items
        const { data: orden } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .eq('id', orden_id)
            .single();

        if (!orden) return res.status(404).json({ success: false, message: 'Orden no encontrada' });

        const { data: items } = await supabaseAdmin
            .from('orden_items')
            .select('*')
            .eq('orden_id', orden_id);

        // Mapear items a formato Mercado Pago
        const mpItems = items.map(it => ({
            title: it.producto_nombre,
            quantity: parseInt(it.cantidad),
            unit_price: parseFloat(it.precio_unitario),
            currency_id: 'ARS'
        }));

        // Crear preferencia con SDK v2
        const preferenceData = {
            items: mpItems,
            payer: {
                email: payer?.email || orden.cliente_email,
                name: payer?.name || orden.cliente_nombre,
                phone: payer?.phone ? { number: payer.phone } : { number: orden.cliente_telefono }
            },
            back_urls: {
                success: BACK_URL_SUCCESS,
                failure: BACK_URL_FAILURE,
                pending: BACK_URL_PENDING
            },
            notification_url: NOTIFICATION_URL,
            auto_return: 'approved',
            external_reference: String(orden.id)
        };

        const mpResponse = await preference.create({ body: preferenceData });
        const initPoint = mpResponse?.init_point || null;
        const preferenceId = mpResponse?.id || null;

        // Guardar registro de pago
        await supabaseAdmin.from('pagos').insert({
            orden_id: orden_id,
            mercadopago_preference_id: preferenceId,
            estado: 'pending',
            monto: orden.total,
            datos_json: mpResponse
        });

        if (!initPoint) return res.status(500).json({ success: false, message: 'No se pudo crear preferencia de Mercado Pago' });

        res.json({ success: true, init_point: initPoint, preferenceId });

    } catch (error) {
        console.error('crearPreferencia error:', error);
        res.status(500).json({ success: false, message: 'Error creando preferencia', error: error.message });
    }
};

/**
 * Webhook para recibir notificaciones de Mercado Pago
 */
export const webhook = async (req, res) => {
    try {
        // Mercado Pago envía distintos formatos. Intentar obtener payment_id
        const mpSecret = process.env.MP_WEBHOOK_SECRET;
        // TODO: validar firma si se configura MP_WEBHOOK_SECRET

        const body = req.body;
        let paymentId = null;

        // Formatos posibles: http query ?id=...&topic=payment, o body.data.id
        if (req.query && req.query.id) paymentId = req.query.id;
        if (!paymentId && body && body.data && body.data.id) paymentId = body.data.id;
        if (!paymentId && body && body.id) paymentId = body.id;

        if (!paymentId) {
            console.warn('Webhook recibido sin payment id:', body);
            return res.status(400).json({ success: false, message: 'No payment id provided' });
        }

        // Obtener detalle del pago desde Mercado Pago con SDK v2
        let paymentData = null;
        try {
            paymentData = await payment.get({ id: paymentId });
        } catch (e) {
            console.error('Error consultando pago MP:', e);
            return res.status(500).json({ success: false, message: 'Error consultando MP', error: e.message });
        }

        const status = paymentData.status; // approved, pending, rejected, in_process
        const preferenceId = paymentData.preference_id || paymentData.order?.id || null;
        const externalRef = paymentData.external_reference || paymentData.order?.external_reference || null;
        const mercadopagoId = paymentData.id || paymentData.transaction_id;

        // Intentar asociar con pago en BD
        // Primero por mercadopago_id
        let pagoRecord = null;
        if (mercadopagoId) {
            const { data: pByMp } = await supabaseAdmin.from('pagos').select('*').eq('mercadopago_id', mercadopagoId).limit(1).maybeSingle();
            if (pByMp) pagoRecord = pByMp;
        }

        // Si no por mp id, buscar por preference id
        if (!pagoRecord && preferenceId) {
            const { data: pByPref } = await supabaseAdmin.from('pagos').select('*').eq('mercadopago_preference_id', preferenceId).limit(1).maybeSingle();
            if (pByPref) pagoRecord = pByPref;
        }

        // Si no, usar external_reference (orden_id)
        if (!pagoRecord && externalRef) {
            const { data: pByOrder } = await supabaseAdmin.from('pagos').select('*').eq('orden_id', externalRef).limit(1).maybeSingle();
            if (pByOrder) pagoRecord = pByOrder;
        }

        // Si no existe pago en BD, crear uno
        if (!pagoRecord) {
            // Si externalRef es una orden id, guardarlo
            const orden_id = externalRef || null;
            const monto = paymentData.transaction_amount || paymentData.total_paid_amount || paymentData.amount || 0;
            const { data: nuevoPago } = await supabaseAdmin.from('pagos').insert({
                orden_id: orden_id,
                mercadopago_id: mercadopagoId,
                mercadopago_preference_id: preferenceId,
                estado: status || 'pending',
                monto,
                datos_json: paymentData
            }).select().maybeSingle();
            pagoRecord = nuevoPago;
        } else {
            // Actualizar pago existente
            await supabaseAdmin.from('pagos').update({
                mercadopago_id: mercadopagoId,
                estado: status || pagoRecord.estado,
                fecha_pago: paymentData.date_approved ? new Date(paymentData.date_approved) : pagoRecord.fecha_pago,
                datos_json: paymentData
            }).eq('id', pagoRecord.id);
        }

        // Actualizar orden según estado
        if (pagoRecord && pagoRecord.orden_id) {
            if (status === 'approved') {
                await supabaseAdmin.from('ordenes').update({ estado: 'pagado', fecha_pago: new Date().toISOString() }).eq('id', pagoRecord.orden_id);

                // Obtener orden e items para notificaciones
                const { data: orden } = await supabaseAdmin.from('ordenes').select('*').eq('id', pagoRecord.orden_id).single();
                const { data: items } = await supabaseAdmin.from('orden_items').select('*').eq('orden_id', pagoRecord.orden_id);

                // Enviar emails y WhatsApp
                try {
                    await enviarEmailConfirmacionPedido(orden, items);
                    await enviarEmailNuevoPedidoAdmin(orden, items);
                } catch (e) {
                    console.error('Error enviando emails tras pago:', e.message);
                }

                try {
                    await enviarWhatsAppConfirmacionCliente(orden);
                    await enviarWhatsAppNuevoPedidoAdmin(orden, items);
                } catch (e) {
                    console.error('Error enviando WhatsApps tras pago:', e.message);
                }

                // Crear acceso a cursos si la orden contiene cursos
                try {
                    // Identificar items que son cursos
                    const cursosEnOrden = items.filter(item => item.producto_tipo === 'curso');
                    
                    if (cursosEnOrden.length > 0) {
                        console.log(`Procesando ${cursosEnOrden.length} curso(s) para ${orden.cliente_email}`);
                        
                        for (const cursoItem of cursosEnOrden) {
                            // Crear acceso con token
                            const { link, token } = await accesoService.crearAccesoCurso(
                                orden.cliente_email,
                                cursoItem.producto_id, // curso_id
                                orden.id // orden_id
                            );
                            
                            console.log(`✓ Acceso creado para curso ${cursoItem.producto_id}: ${link}`);
                            
                            // Enviar email con enlace de acceso
                            await enviarEmailAccesoCurso(orden.cliente_email, {
                                nombre_curso: cursoItem.producto_nombre,
                                link_acceso: link,
                                cliente_nombre: orden.cliente_nombre
                            });
                            
                            console.log(`✓ Email de acceso enviado a ${orden.cliente_email}`);
                        }
                    }
                } catch (e) {
                    console.error('Error creando accesos a cursos:', e.message);
                    // No fallar el webhook por esto
                }

                // Si la orden corresponde a la compra de un curso, desbloquear (por implementar)
                // TODO: implementar lógica de usuarios_cursos si aplica
            } else if (status === 'pending' || status === 'in_process') {
                await supabaseAdmin.from('ordenes').update({ estado: 'pendiente' }).eq('id', pagoRecord.orden_id);
            } else if (status === 'rejected' || status === 'cancelled') {
                await supabaseAdmin.from('ordenes').update({ estado: 'pendiente' }).eq('id', pagoRecord.orden_id);
            }
        }

        // Responder 200 a Mercado Pago
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, message: 'Error procesando webhook', error: error.message });
    }
};

export default { crearPreferencia, webhook };
