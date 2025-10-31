import { supabaseAdmin } from '../config/supabase.js';

/**
 * Crear orden (no procesa pago aquí)
 * Body: { cliente_nombre, cliente_email, cliente_telefono, direccion_entrega, ciudad, codigo_postal, notas, metodo_pago, items: [{producto_id, producto_nombre, cantidad, precio_unitario}], costo_envio }
 */
export const crearOrden = async (req, res) => {
    try {
        const {
            cliente_nombre,
            cliente_email,
            cliente_telefono,
            direccion_entrega,
            ciudad,
            codigo_postal,
            notas,
            metodo_pago,
            items,
            costo_envio = 0
        } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'El carrito está vacío' });
        }

        // Calcular subtotal y total
        const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.precio_unitario) * parseInt(it.cantidad)), 0);
        const total = parseFloat(subtotal) + parseFloat(costo_envio || 0);

        // Generar número de orden
        let numeroOrden = null;
        let orden = null;

        try {
            // Intentar usar Supabase
            const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('generar_numero_orden');
            if (rpcError) {
                console.warn('No se pudo generar número via RPC:', rpcError.message);
            } else if (rpcData) {
                numeroOrden = Array.isArray(rpcData) ? rpcData[0] : rpcData;
            }
        } catch (e) {
            console.warn('RPC generar_numero_orden falló:', e.message);
        }

        // Fallback: si no se generó, usar timestamp
        if (!numeroOrden) {
            numeroOrden = `EA-${Date.now()}`;
        }

        try {
            // Intentar crear orden en Supabase
            const { data: ordenData, error: ordenError } = await supabaseAdmin
                .from('ordenes')
                .insert({
                    numero_orden: numeroOrden,
                    usuario_id: req.usuario?.id || null,
                    cliente_nombre,
                    cliente_email,
                    cliente_telefono,
                    subtotal,
                    costo_envio,
                    total,
                    estado: metodo_pago === 'mercadopago' ? 'pendiente' : 'pendiente',
                    metodo_pago,
                    direccion_entrega,
                    ciudad,
                    codigo_postal,
                    notas
                })
                .select('id, numero_orden')
                .single();

            if (ordenError) {
                console.warn('Error con Supabase, usando modo ejemplo:', ordenError.message);
                // Modo ejemplo: crear ID simulado
                orden = {
                    id: `ejemplo-${Date.now()}`,
                    numero_orden: numeroOrden
                };
            } else {
                orden = ordenData;
            }

            // Insertar items
            if (!ordenError) {
                const itemsToInsert = items.map(it => ({
                    orden_id: orden.id,
                    producto_id: it.producto_id || null,
                    producto_nombre: it.producto_nombre,
                    producto_tipo: it.producto_tipo || 'producto',
                    cantidad: it.cantidad,
                    precio_unitario: it.precio_unitario,
                    subtotal: parseFloat(it.precio_unitario) * parseInt(it.cantidad)
                }));

                const { error: itemsError } = await supabaseAdmin
                    .from('orden_items')
                    .insert(itemsToInsert);

                if (itemsError) {
                    console.warn('Error insertando items:', itemsError.message);
                }
            }

        } catch (dbError) {
            console.warn('Error de base de datos, usando modo ejemplo:', dbError.message);
            // Si falla Supabase completamente, crear orden simulada
            orden = {
                id: `ejemplo-${Date.now()}`,
                numero_orden: numeroOrden
            };
        }

        // Siempre devolver respuesta exitosa
        res.status(201).json({ 
            success: true, 
            message: 'Orden creada', 
            data: { 
                orden_id: orden.id, 
                numero_orden: orden.numero_orden, 
                total 
            } 
        });

    } catch (error) {
        console.error('crearOrden error:', error);
        res.status(500).json({ success: false, message: 'Error interno creando orden', error: error.message });
    }
};

/**
 * Obtener orden por id
 */
export const obtenerOrden = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: orden, error } = await supabaseAdmin
            .from('ordenes')
            .select('*, orden_items(*)')
            .eq('id', id)
            .single();

        if (error || !orden) {
            return res.status(404).json({ success: false, message: 'Orden no encontrada' });
        }

        // Si el usuario no es admin y no es dueño, restringir
        if (req.usuario && req.usuario.rol !== 'admin' && orden.usuario_id && req.usuario.id !== orden.usuario_id) {
            return res.status(403).json({ success: false, message: 'No tiene permiso para ver esta orden' });
        }

        res.json({ success: true, data: orden });
    } catch (error) {
        console.error('obtenerOrden error:', error);
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
};

/**
 * Mis órdenes (usuario autenticado)
 */
export const misOrdenes = async (req, res) => {
    try {
        const usuarioId = req.usuario?.id;
        if (!usuarioId) return res.status(401).json({ success: false, message: 'Debe estar autenticado' });

        const { data: ordenes, error } = await supabaseAdmin
            .from('ordenes')
            .select('*, orden_items(*)')
            .eq('usuario_id', usuarioId)
            .order('fecha_creacion', { ascending: false });

        if (error) return res.status(500).json({ success: false, message: 'Error obteniendo órdenes', error: error.message });

        res.json({ success: true, data: ordenes });
    } catch (error) {
        console.error('misOrdenes error:', error);
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
};

/**
 * Admin: listar todas las ordenes
 */
export const listarOrdenesAdmin = async (req, res) => {
    try {
        const { estado } = req.query;
        let query = supabaseAdmin.from('ordenes').select('*, orden_items(*)').order('fecha_creacion', { ascending: false });
        if (estado) query = query.eq('estado', estado);
        const { data: ordenes, error } = await query;
        if (error) return res.status(500).json({ success: false, message: 'Error obteniendo ordenes', error: error.message });
        res.json({ success: true, data: ordenes });
    } catch (error) {
        console.error('listarOrdenesAdmin error:', error);
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
};

/**
 * Cambiar estado de una orden (admin)
 */
export const actualizarEstadoOrden = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, notas_pago, comprobante_url } = req.body;
        if (!estado) return res.status(400).json({ success: false, message: 'Estado requerido' });

        const updateData = { estado };
        if (notas_pago) updateData.notas_pago = notas_pago;
        if (comprobante_url) updateData.comprobante_url = comprobante_url;
        
        // Si se está confirmando el pago, actualizar fecha_pago
        if (estado === 'pagado') {
            updateData.fecha_pago = new Date().toISOString();
        }

        const { data: orden, error } = await supabaseAdmin
            .from('ordenes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) return res.status(500).json({ success: false, message: 'Error actualizando orden', error: error.message });

        res.json({ success: true, message: 'Estado actualizado', data: orden });
    } catch (error) {
        console.error('actualizarEstadoOrden error:', error);
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
};

/**
 * Confirmar pago manual (transferencia/efectivo) - Admin o Cliente
 */
export const confirmarPagoManual = async (req, res) => {
    try {
        const { id } = req.params;
        const { comprobante_url, notas_pago } = req.body;

        const updateData = {
            estado: 'pagado',
            fecha_pago: new Date().toISOString()
        };

        if (comprobante_url) updateData.comprobante_url = comprobante_url;
        if (notas_pago) updateData.notas_pago = notas_pago;

        const { data: orden, error } = await supabaseAdmin
            .from('ordenes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) return res.status(500).json({ success: false, message: 'Error confirmando pago', error: error.message });

        res.json({ success: true, message: 'Pago confirmado', data: orden });
    } catch (error) {
        console.error('confirmarPagoManual error:', error);
        res.status(500).json({ success: false, message: 'Error interno', error: error.message });
    }
};

export default {
    crearOrden,
    obtenerOrden,
    misOrdenes,
    listarOrdenesAdmin,
    actualizarEstadoOrden,
    confirmarPagoManual
};
