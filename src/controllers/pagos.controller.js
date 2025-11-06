import { preference, payment } from '../config/mercadopago.js';
import { supabaseAdmin } from '../config/supabase.js';
import { enviarEmailConfirmacionPedido, enviarEmailNuevoPedidoAdmin, enviarEmailAccesoCurso } from '../services/email.service.js';
import { enviarWhatsAppConfirmacionCliente, enviarWhatsAppNuevoPedidoAdmin } from '../services/whatsapp.service.js';
import accesoService from '../services/acceso-cursos.service.js';
import { logSecurityEvent, SECURITY_EVENTS, SEVERITY } from '../utils/security-logger.js';

const NOTIFICATION_URL = `${process.env.WEBHOOK_BASE_URL || 'http://localhost:3000'}/api/pagos/webhook`;
const BACK_URL_SUCCESS = process.env.SUCCESS_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-exitoso.html`;
const BACK_URL_FAILURE = process.env.FAILURE_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-fallido.html`;
const BACK_URL_PENDING = process.env.PENDING_URL || `${process.env.CLIENT_URL || 'http://localhost:5500'}/pago-pendiente.html`;

/**
 * Crear preferencia de Mercado Pago para una orden existente
 * Body: { orden_id, payer: { email, name, phone } }
 * 🔒 SEGURIDAD: Validaciones completas y prevención de fraudes
 */
export const crearPreferencia = async (req, res) => {
    try {
        const { orden_id, payer } = req.body;
        
        // 1️⃣ VALIDACIÓN: orden_id requerido
        if (!orden_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'orden_id es requerido' 
            });
        }

        // 2️⃣ OBTENER ORDEN: Verificar existencia
        const { data: orden, error: ordenError } = await supabaseAdmin
            .from('ordenes')
            .select('*')
            .eq('id', orden_id)
            .single();

        if (ordenError || !orden) {
            return res.status(404).json({ 
                success: false, 
                message: 'Orden no encontrada' 
            });
        }

        // 3️⃣ VALIDACIÓN DE SEGURIDAD: Estado de la orden
        if (orden.estado === 'pagado') {
            return res.status(400).json({ 
                success: false, 
                message: 'Esta orden ya fue pagada',
                orden_numero: orden.numero_orden
            });
        }

        if (orden.estado === 'cancelado') {
            return res.status(400).json({ 
                success: false, 
                message: 'Esta orden está cancelada',
                orden_numero: orden.numero_orden
            });
        }

        // 🔒 SEGURIDAD ADICIONAL: Evitar múltiples preferencias activas
        // Verificar si ya existe una preferencia activa creada recientemente (últimas 24h)
        if (orden.mercadopago_preference_id && orden.estado === 'pendiente_pago') {
            // Verificar antigüedad de la preferencia
            const { data: pagoExistente } = await supabaseAdmin
                .from('pagos')
                .select('created_at')
                .eq('mercadopago_preference_id', orden.mercadopago_preference_id)
                .eq('estado', 'pending')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (pagoExistente) {
                const tiempoTranscurrido = Date.now() - new Date(pagoExistente.created_at).getTime();
                const horasTranscurridas = tiempoTranscurrido / (1000 * 60 * 60);

                // Si la preferencia tiene menos de 24 horas, no crear una nueva
                if (horasTranscurridas < 24) {
                    // Registrar intento de pago duplicado
                    await logSecurityEvent(
                        SECURITY_EVENTS.DUPLICATE_PAYMENT,
                        SEVERITY.HIGH,
                        {
                            orden_id,
                            preference_existente: orden.mercadopago_preference_id,
                            horas_transcurridas: horasTranscurridas.toFixed(2)
                        },
                        req
                    );

                    return res.status(400).json({
                        success: false,
                        message: 'Ya existe un pago pendiente para esta orden. Por favor, completa el pago anterior o espera 24 horas.',
                        preferencia_existente: orden.mercadopago_preference_id
                    });
                }
            }
        }

        // 4️⃣ OBTENER ITEMS: Para calcular total
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('orden_items')
            .select('*')
            .eq('orden_id', orden_id);

        if (itemsError || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Orden sin items' 
            });
        }

        // 5️⃣ VALIDACIÓN CRÍTICA DE SEGURIDAD: Verificar precios contra la base de datos
        // NO confiar en los precios almacenados en orden_items (pueden ser manipulados)
        // Obtener precios REALES y ACTUALES de productos/cursos
        let preciosManipulados = false;
        let subtotalReal = 0;

        for (const item of items) {
            let precioReal = null;
            
            // Obtener precio real según el tipo de producto
            if (item.producto_tipo === 'curso') {
                // Buscar en tabla de cursos
                const { data: curso } = await supabaseAdmin
                    .from('cursos')
                    .select('precio')
                    .eq('id', item.producto_id)
                    .single();
                
                precioReal = curso ? parseFloat(curso.precio) : null;
            } else {
                // Buscar en tabla de productos
                const { data: producto } = await supabaseAdmin
                    .from('productos')
                    .select('precio')
                    .eq('id', item.producto_id)
                    .single();
                
                precioReal = producto ? parseFloat(producto.precio) : null;
            }

            // Verificar si el producto existe y el precio coincide
            if (!precioReal) {
                console.error('⚠️ Producto no encontrado en BD:', {
                    producto_id: item.producto_id,
                    tipo: item.producto_tipo
                });
                
                return res.status(400).json({ 
                    success: false, 
                    message: 'Uno de los productos ya no está disponible. Por favor, recarga el carrito.'
                });
            }

            const precioItem = parseFloat(item.precio_unitario);
            const diferencia = Math.abs(precioReal - precioItem);

            // Tolerancia de $0.01 para redondeo
            if (diferencia > 0.01) {
                // Registrar evento de seguridad
                await logSecurityEvent(
                    SECURITY_EVENTS.PRICE_MANIPULATION,
                    SEVERITY.CRITICAL,
                    {
                        producto_id: item.producto_id,
                        nombre: item.producto_nombre,
                        precio_real: precioReal,
                        precio_enviado: precioItem,
                        diferencia: diferencia,
                        orden_id: orden_id
                    },
                    req
                );
                
                preciosManipulados = true;
                break;
            }

            // Calcular subtotal con precio REAL (no el enviado por el cliente)
            subtotalReal += precioReal * parseInt(item.cantidad);
        }

        // Si se detectó manipulación, rechazar la transacción
        if (preciosManipulados) {
            return res.status(400).json({ 
                success: false, 
                message: 'Los precios han cambiado. Por favor, recarga la página y vuelve a intentar.'
            });
        }

        // 6️⃣ VALIDACIÓN FINAL: Verificar total de la orden
        const totalReal = subtotalReal + (orden.costo_envio || 0);
        const totalOrden = parseFloat(orden.total);

        // Verificar que no haya manipulación del total (tolerancia 0.01 por redondeo)
        if (Math.abs(totalReal - totalOrden) > 0.01) {
            console.error('🚨 MANIPULACIÓN DEL TOTAL DETECTADA:', {
                total_real: totalReal,
                total_orden: totalOrden,
                diferencia: Math.abs(totalReal - totalOrden),
                orden_id: orden_id,
                timestamp: new Date().toISOString()
            });
            
            return res.status(400).json({ 
                success: false, 
                message: 'Error en el cálculo del total. Por favor, recarga la página.'
            });
        }

        // 6️⃣ MAPEAR ITEMS: Formato Mercado Pago
        const mpItems = items.map(item => ({
            id: String(item.producto_id || item.id),
            title: item.producto_nombre,
            quantity: parseInt(item.cantidad),
            unit_price: parseFloat(item.precio_unitario),
            currency_id: 'ARS',
            description: item.producto_tipo === 'curso' ? 'Curso online' : 'Producto de panadería'
        }));

        // Agregar costo de envío como item separado si existe
        if (orden.costo_envio && orden.costo_envio > 0) {
            mpItems.push({
                id: 'envio',
                title: 'Costo de Envío',
                quantity: 1,
                unit_price: parseFloat(orden.costo_envio),
                currency_id: 'ARS'
            });
        }

        // 7️⃣ CREAR PREFERENCIA: Con todas las medidas de seguridad
        const preferenceData = {
            items: mpItems,
            
            // Información del comprador
            payer: {
                email: payer?.email || orden.cliente_email,
                name: payer?.name || orden.cliente_nombre,
                phone: payer?.phone ? { number: payer.phone } : { number: orden.cliente_telefono },
                address: {
                    street_name: orden.direccion_entrega || '',
                    zip_code: orden.codigo_postal || ''
                }
            },
            // URLs de retorno
            back_urls: {
                success: `${BACK_URL_SUCCESS}?orden=${orden_id}`,
                failure: `${BACK_URL_FAILURE}?orden=${orden_id}`,
                pending: `${BACK_URL_PENDING}?orden=${orden_id}`
            },
            
            // Webhook para notificaciones (CRÍTICO)
            notification_url: NOTIFICATION_URL,
            
            // Retorno automático si se aprueba
            auto_return: 'approved',
            
            // Referencia externa (para identificar en webhooks)
            external_reference: String(orden.id),
            
            // Metadata adicional para tracking
            metadata: {
                orden_id: orden.id,
                numero_orden: orden.numero_orden,
                cliente_email: orden.cliente_email,
                timestamp: new Date().toISOString()
            },

            // Configuración de pagos
            payment_methods: {
                excluded_payment_types: [], // Permitir todos los métodos
                installments: 12 // Máximo 12 cuotas
            },

            // Expiración de la preferencia (24 horas)
            expires: true,
            expiration_date_from: new Date().toISOString(),
            expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),

            // NO usar modo binario (permite estados pendientes)
            binary_mode: false,

            // Nombre que aparece en el resumen de tarjeta
            statement_descriptor: 'El Artesano'
        };

        // 8️⃣ CREAR PREFERENCIA: Llamada a Mercado Pago API
        const mpResponse = await preference.create({ body: preferenceData });
        
        if (!mpResponse || !mpResponse.id) {
            throw new Error('Error creando preferencia en Mercado Pago');
        }

        const initPoint = mpResponse.init_point;
        const preferenceId = mpResponse.id;

        // 9️⃣ GUARDAR REGISTRO: Actualizar orden con preference_id
        await supabaseAdmin
            .from('ordenes')
            .update({ 
                mercadopago_preference_id: preferenceId,
                estado: 'pendiente_pago'
            })
            .eq('id', orden_id);

        // 🔟 REGISTRAR PAGO: En tabla de pagos para auditoría
        await supabaseAdmin.from('pagos').insert({
            orden_id: orden_id,
            mercadopago_preference_id: preferenceId,
            estado: 'pending',
            monto: orden.total,
            datos_json: {
                preference_id: preferenceId,
                init_point: initPoint,
                created_at: mpResponse.date_created
            }
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
 * 🔒 SEGURIDAD: Verifica firma x-signature para prevenir webhooks falsos
 */
export const webhook = async (req, res) => {
    try {
        // 1️⃣ VALIDACIÓN DE FIRMA: Verificar que el webhook viene de Mercado Pago
        const xSignature = req.headers['x-signature'];
        const xRequestId = req.headers['x-request-id'];
        
        if (xSignature && xRequestId) {
            const mpSecret = process.env.MP_WEBHOOK_SECRET;
            
            if (mpSecret) {
                try {
                    // Mercado Pago firma: TS;HASH
                    const parts = xSignature.split(',');
                    let ts = null;
                    let hash = null;
                    
                    parts.forEach(part => {
                        const [key, value] = part.split('=');
                        if (key && value) {
                            const cleanKey = key.trim();
                            const cleanValue = value.trim();
                            if (cleanKey === 'ts') ts = cleanValue;
                            if (cleanKey === 'v1') hash = cleanValue;
                        }
                    });
                    
                    if (ts && hash) {
                        // Construir manifest según documentación de MP
                        const crypto = await import('crypto');
                        const queryParams = new URLSearchParams(req.query).toString();
                        const manifest = `id:${req.query.id || req.body?.data?.id};request-id:${xRequestId};ts:${ts};`;
                        
                        // Generar HMAC SHA256
                        const hmac = crypto.createHmac('sha256', mpSecret);
                        hmac.update(manifest);
                        const expectedHash = hmac.digest('hex');
                        
                        // Comparar hashes
                        if (hash !== expectedHash) {
                            // Registrar webhook con firma inválida
                            await logSecurityEvent(
                                SECURITY_EVENTS.INVALID_WEBHOOK,
                                SEVERITY.CRITICAL,
                                {
                                    hash_recibido: hash,
                                    hash_esperado: expectedHash,
                                    manifest,
                                    payment_id: req.query.id || req.body?.data?.id
                                },
                                req
                            );
                            
                            return res.status(401).json({ 
                                success: false, 
                                message: 'Firma inválida' 
                            });
                        }
                        
                        console.log('✅ Firma de webhook verificada correctamente');
                    } else {
                        console.warn('⚠️ Webhook sin componentes de firma válidos (ts o v1)');
                    }
                } catch (signatureError) {
                    console.error('Error validando firma de webhook:', signatureError);
                    // Continuar procesando pero logear el error
                }
            } else {
                console.warn('⚠️ MP_WEBHOOK_SECRET no configurado. Firma de webhook NO verificada.');
            }
        } else {
            console.warn('⚠️ Webhook sin x-signature o x-request-id headers');
        }

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
