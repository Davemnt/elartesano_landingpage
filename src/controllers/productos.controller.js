import { supabaseAdmin } from '../config/supabase.js';
import fs from 'fs';
import path from 'path';

// Función para cargar productos creados desde archivo
function cargarProductosCreados() {
    try {
        const archivoPath = path.join(process.cwd(), 'src', 'data', 'productos-creados.json');
        if (fs.existsSync(archivoPath)) {
            const data = fs.readFileSync(archivoPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.warn('⚠️ Error cargando productos creados:', error.message);
    }
    return [];
}

// Función para guardar productos creados en archivo
function guardarProductosCreados(productos) {
    try {
        const archivoPath = path.join(process.cwd(), 'src', 'data', 'productos-creados.json');
        fs.writeFileSync(archivoPath, JSON.stringify(productos, null, 2), 'utf8');
        console.log(`💾 Productos guardados en archivo: ${productos.length} items`);
    } catch (error) {
        console.error('❌ Error guardando productos:', error.message);
    }
}

// Lista de productos creados dinámicamente (persistente)
let productosCreados = cargarProductosCreados();

// Productos de ejemplo para cuando Supabase no esté configurado
const productosEjemplo = [
    {
        id: '1',
        nombre: 'Torta Artesanal',
        descripcion: 'Exquisitas tortas para cada ocasión especial, elaboradas con ingredientes premium',
        precio: 450,
        imagen_url: '/img/torta.jpg',
        categoria: 'Tortas',
        stock: 10,
        activo: true,
        destacado: true
    },
    {
        id: '2',
        nombre: 'Pan Artesanal',
        descripcion: 'Variedad de panes tradicionales y especiales, horneados diariamente',
        precio: 120,
        imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600',
        categoria: 'Panes',
        stock: 50,
        activo: true,
        destacado: true
    },
    {
        id: '3',
        nombre: 'Sándwich de Miga',
        descripcion: 'Frescos y deliciosos para tus eventos y reuniones especiales',
        precio: 85,
        imagen_url: '/img/sandwich-miga.jpg',
        categoria: 'Sándwiches',
        stock: 30,
        activo: true,
        destacado: false
    },
    {
        id: '4',
        nombre: 'Facturas',
        descripcion: 'Medialunas, vigilantes y más delicias para acompañar tu café matutino',
        precio: 65,
        imagen_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
        categoria: 'Facturas',
        stock: 100,
        activo: true,
        destacado: true
    },
    {
        id: '5',
        nombre: 'Masas Secas',
        descripcion: 'Dulces tentaciones para acompañar tu café, galletas y más',
        precio: 95,
        imagen_url: '/img/masas secas.jpg',
        categoria: 'Masas',
        stock: 40,
        activo: true,
        destacado: false
    },
    {
        id: '6',
        nombre: 'Especialidad del Chef',
        descripcion: 'Creaciones únicas y limitadas, especialmente diseñadas para sorprenderte',
        precio: 200,
        imagen_url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600',
        categoria: 'Especialidades',
        stock: 5,
        activo: true,
        destacado: true
    }
];

/**
 * Obtener todos los productos activos
 */
export const obtenerProductos = async (req, res) => {
    try {
        const { categoria, destacado } = req.query;
        
        console.log('📦 GET /api/productos - Iniciando...');
        
        let query = supabaseAdmin
            .from('productos')
            .select('*')
            .eq('activo', true)
            .order('fecha_creacion', { ascending: false });

        if (categoria) {
            query = query.eq('categoria', categoria);
        }

        if (destacado === 'true') {
            query = query.eq('destacado', true);
        }

        const { data: productos, error } = await query;

        // Si hay error de conexión o Supabase no configurado, usar datos de ejemplo
        if (error) {
            console.warn('⚠️ Error conectando a Supabase, usando productos de ejemplo + creados');
            console.log('Error de Supabase:', error.message);
            
            // Combinar productos de ejemplo con productos creados dinámicamente
            let productosRespuesta = [...productosEjemplo, ...productosCreados];
            
            // Aplicar filtros
            if (categoria) {
                productosRespuesta = productosRespuesta.filter(p => p.categoria === categoria);
            }
            if (destacado === 'true') {
                productosRespuesta = productosRespuesta.filter(p => p.destacado === true);
            }
            
            console.log(`✅ Devolviendo ${productosRespuesta.length} productos (${productosEjemplo.length} ejemplo + ${productosCreados.length} creados)`);
            return res.json({
                success: true,
                data: productosRespuesta,
                total: productosRespuesta.length,
                modo: 'ejemplo_con_creados'
            });
        }

        console.log(`✅ Devolviendo ${productos.length} productos de Supabase`);
        res.json({
            success: true,
            data: productos,
            total: productos.length
        });
    } catch (error) {
        console.warn('⚠️ Error conectando a Supabase, usando productos de ejemplo + creados:', error.message);
        
        // Combinar productos de ejemplo con productos creados dinámicamente
        const productosRespuesta = [...productosEjemplo, ...productosCreados];
        
        console.log(`✅ Devolviendo ${productosRespuesta.length} productos (${productosEjemplo.length} ejemplo + ${productosCreados.length} creados) (catch)`);
        
        // En caso de error, devolver productos de ejemplo + creados
        res.json({
            success: true,
            data: productosRespuesta,
            total: productosRespuesta.length,
            modo: 'ejemplo_con_creados'
        });
    }
};

/**
 * Obtener un producto por ID
 */
export const obtenerProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: producto, error } = await supabaseAdmin
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !producto) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.json({
            success: true,
            data: producto
        });
    } catch (error) {
        console.error('Error en obtenerProducto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Crear producto (Admin)
 */
export const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, imagen_url, categoria, stock, destacado } = req.body;

        console.log('📦 Creando producto:', { nombre, categoria, precio, imagen_url });

        // Si tenemos Supabase configurado, usarlo
        if (supabaseAdmin) {
            const { data: producto, error } = await supabaseAdmin
                .from('productos')
                .insert({
                    nombre,
                    descripcion,
                    precio,
                    imagen_url,
                    categoria,  
                    stock: stock || 0,
                    destacado: destacado || false,
                    activo: true
                })
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: producto
            });
        }

        // Modo desarrollo sin base de datos - simular creación
        console.log('⚠️ Modo desarrollo: simulando creación de producto');
        
        const productoSimulado = {
            id: Date.now(), // ID simulado
            nombre,
            descripcion,
            precio: parseFloat(precio),
            imagen_url,
            categoria,
            stock: parseInt(stock) || 0,
            destacado: destacado || false,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Agregar a la lista de productos creados
        productosCreados.push(productoSimulado);
        
        // Guardar en archivo para persistencia
        guardarProductosCreados(productosCreados);

        console.log('✅ Producto simulado creado:', productoSimulado);
        console.log(`📦 Total productos en memoria: ${productosCreados.length}`);

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente (modo desarrollo)',
            data: productoSimulado,
            nota: 'Este producto solo existe en memoria. Configura Supabase para persistencia real.'
        });

    } catch (error) {
        console.error('❌ Error en crearProducto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Actualizar producto (Admin)
 */
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, imagen_url, categoria, stock, activo, destacado } = req.body;

        console.log('📦 Actualizando producto:', { id, nombre, categoria, precio });

        const updates = {};
        if (nombre !== undefined) updates.nombre = nombre;
        if (descripcion !== undefined) updates.descripcion = descripcion;
        if (precio !== undefined) updates.precio = precio;
        if (imagen_url !== undefined) updates.imagen_url = imagen_url;
        if (categoria !== undefined) updates.categoria = categoria;
        if (stock !== undefined) updates.stock = stock;
        if (activo !== undefined) updates.activo = activo;
        if (destacado !== undefined) updates.destacado = destacado;

        // Si tenemos Supabase configurado, usarlo
        if (supabaseAdmin) {
            const { data: producto, error } = await supabaseAdmin
                .from('productos')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: producto
            });
        }

        // Modo desarrollo sin base de datos - actualizar en memoria y archivo
        console.log('⚠️ Modo desarrollo: actualizando producto en memoria');
        
        // Buscar el producto en los productos creados
        const indiceProducto = productosCreados.findIndex(p => p.id == id);
        
        if (indiceProducto === -1) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Actualizar el producto
        productosCreados[indiceProducto] = {
            ...productosCreados[indiceProducto],
            ...updates,
            updated_at: new Date().toISOString()
        };

        // Guardar cambios en archivo
        guardarProductosCreados(productosCreados);

        console.log('✅ Producto actualizado:', productosCreados[indiceProducto]);

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            data: productosCreados[indiceProducto]
        });

    } catch (error) {
        console.error('❌ Error en actualizarProducto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Eliminar producto (Admin) - Soft delete
 */
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        console.log('📦 Eliminando producto:', { id });

        // Si tenemos Supabase configurado, usarlo
        if (supabaseAdmin) {
            const { data: producto, error } = await supabaseAdmin
                .from('productos')
                .update({ activo: false })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            return res.json({
                success: true,
                message: 'Producto eliminado exitosamente',
                data: producto
            });
        }

        // Modo desarrollo sin base de datos - simular eliminación
        console.log('⚠️ Modo desarrollo: simulando eliminación de producto');

        const productoSimulado = {
            id: parseInt(id),
            activo: false,
            updated_at: new Date().toISOString()
        };

        console.log('✅ Producto simulado eliminado:', productoSimulado);

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente (modo desarrollo)',
            data: productoSimulado,
            nota: 'Esta eliminación solo existe en memoria. Configura Supabase para persistencia real.'
        });

    } catch (error) {
        console.error('❌ Error en eliminarProducto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

export default {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};
