# 💰 Guía: Validación de Precios

## **❌ NUNCA Confiar en el Cliente:**

```javascript
// ❌ MALO - Backend confía en datos del frontend
export const crearOrden = async (req, res) => {
  const { items, total } = req.body; // Cliente envía esto
  
  // Crear orden con datos del cliente (¡PELIGRO!)
  await db.insert('ordenes', {
    total: total, // Cliente puede haber cambiado esto
    items: items  // Cliente puede haber modificado precios
  });
};
```

**Problema:** Cliente puede modificar `total` o `precio` antes de enviar.

---

## **✅ SIEMPRE Validar en Backend:**

### **Implementación Completa:**

```javascript
// src/controllers/ordenes.controller.js
export const crearOrden = async (req, res) => {
  try {
    const { items, cliente_nombre, cliente_email, costo_envio } = req.body;
    
    // 1️⃣ VALIDAR: Items no vacíos
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Carrito vacío' 
      });
    }
    
    // 2️⃣ OBTENER PRECIOS REALES: Desde la base de datos
    const itemsValidados = [];
    
    for (const item of items) {
      // Buscar producto/curso en BD
      let precioReal;
      
      if (item.producto_tipo === 'curso') {
        const { data: curso } = await supabase
          .from('cursos')
          .select('precio, nombre')
          .eq('id', item.producto_id)
          .single();
        
        if (!curso) {
          return res.status(404).json({ 
            error: `Curso #${item.producto_id} no encontrado` 
          });
        }
        
        precioReal = parseFloat(curso.precio);
        
      } else {
        const { data: producto } = await supabase
          .from('productos')
          .select('precio, nombre')
          .eq('id', item.producto_id)
          .single();
        
        if (!producto) {
          return res.status(404).json({ 
            error: `Producto #${item.producto_id} no encontrado` 
          });
        }
        
        precioReal = parseFloat(producto.precio);
      }
      
      // 3️⃣ COMPARAR: Precio del cliente vs. precio real
      const precioCliente = parseFloat(item.precio_unitario);
      
      if (Math.abs(precioReal - precioCliente) > 0.01) {
        console.error('⚠️ Manipulación de precio detectada:', {
          producto_id: item.producto_id,
          precioReal,
          precioCliente,
          diferencia: Math.abs(precioReal - precioCliente)
        });
        
        return res.status(400).json({ 
          error: 'Los precios han cambiado. Por favor, recarga la página.',
          producto: item.producto_nombre
        });
      }
      
      // Usar precio REAL (no el del cliente)
      itemsValidados.push({
        producto_id: item.producto_id,
        producto_nombre: item.producto_nombre,
        producto_tipo: item.producto_tipo,
        cantidad: parseInt(item.cantidad),
        precio_unitario: precioReal // ← PRECIO REAL
      });
    }
    
    // 4️⃣ CALCULAR TOTAL: En el backend
    const subtotal = itemsValidados.reduce((sum, item) => {
      return sum + (item.precio_unitario * item.cantidad);
    }, 0);
    
    const costoEnvioValidado = parseFloat(costo_envio) || 50;
    const totalCalculado = subtotal + costoEnvioValidado;
    
    // 5️⃣ CREAR ORDEN: Con datos validados
    const { data: orden, error } = await supabase
      .from('ordenes')
      .insert({
        numero_orden: `ORD-${Date.now()}`,
        cliente_nombre,
        cliente_email,
        subtotal: subtotal,
        costo_envio: costoEnvioValidado,
        total: totalCalculado, // ← TOTAL CALCULADO EN BACKEND
        estado: 'pendiente'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // 6️⃣ INSERTAR ITEMS: Con precios validados
    const itemsConOrden = itemsValidados.map(item => ({
      ...item,
      orden_id: orden.id
    }));
    
    await supabase.from('orden_items').insert(itemsConOrden);
    
    // Retornar orden con total REAL
    res.json({
      success: true,
      data: {
        orden_id: orden.id,
        numero_orden: orden.numero_orden,
        total: totalCalculado // Total validado
      }
    });
    
  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ error: 'Error creando orden' });
  }
};
```

---

## **Protección en el Controlador de Pagos:**

```javascript
// src/controllers/pagos.controller.js
export const crearPreferencia = async (req, res) => {
  try {
    const { orden_id } = req.body;
    
    // 1️⃣ OBTENER ORDEN: De la base de datos
    const { data: orden } = await supabase
      .from('ordenes')
      .select('*')
      .eq('id', orden_id)
      .single();
    
    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    
    // 2️⃣ OBTENER ITEMS: De la base de datos
    const { data: items } = await supabase
      .from('orden_items')
      .select('*')
      .eq('orden_id', orden_id);
    
    // 3️⃣ RE-CALCULAR TOTAL: Por seguridad
    const subtotalRecalculado = items.reduce((sum, item) => {
      return sum + (parseFloat(item.precio_unitario) * parseInt(item.cantidad));
    }, 0);
    
    const totalRecalculado = subtotalRecalculado + (orden.costo_envio || 0);
    const totalOrden = parseFloat(orden.total);
    
    // 4️⃣ VALIDAR: Que no haya manipulación
    if (Math.abs(totalRecalculado - totalOrden) > 0.01) {
      console.error('⚠️ Diferencia en total detectada:', {
        orden_id,
        totalOrden,
        totalRecalculado,
        diferencia: Math.abs(totalRecalculado - totalOrden)
      });
      
      // Actualizar con total correcto
      await supabase
        .from('ordenes')
        .update({ total: totalRecalculado })
        .eq('id', orden_id);
      
      return res.status(400).json({ 
        error: 'Error en el cálculo. Por favor, intenta nuevamente.'
      });
    }
    
    // 5️⃣ CREAR PREFERENCIA: Con total VALIDADO
    const mpItems = items.map(item => ({
      title: item.producto_nombre,
      quantity: parseInt(item.cantidad),
      unit_price: parseFloat(item.precio_unitario), // Precio de BD
      currency_id: 'ARS'
    }));
    
    if (orden.costo_envio > 0) {
      mpItems.push({
        title: 'Envío',
        quantity: 1,
        unit_price: parseFloat(orden.costo_envio),
        currency_id: 'ARS'
      });
    }
    
    const result = await preference.create({
      body: {
        items: mpItems,
        external_reference: String(orden_id)
      }
    });
    
    res.json({
      success: true,
      data: {
        preference_id: result.id,
        init_point: result.init_point
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error procesando pago' });
  }
};
```

---

## **Frontend: Mostrar Precios (Solo Visual)**

```javascript
// index.html - Solo para mostrar al usuario
function agregarAlCarrito(nombre, precio) {
  carrito.push({
    nombre: nombre,
    precio: precio, // Solo para mostrar en UI
    cantidad: 1
  });
  
  actualizarCarrito();
}

function finalizarCompra() {
  // El frontend SOLO envía IDs y cantidades
  const payload = {
    cliente_nombre: document.getElementById('nombre').value,
    cliente_email: document.getElementById('email').value,
    items: carrito.map(item => ({
      producto_id: item.id,     // Solo ID
      producto_nombre: item.nombre, // Para referencia
      producto_tipo: 'producto',
      cantidad: item.cantidad,
      precio_unitario: item.precio // Backend lo validará
    })),
    costo_envio: 50
    // NO enviar total - backend lo calcula
  };
  
  fetch('/api/ordenes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    // Backend retorna el total REAL
    console.log('Total validado:', data.data.total);
  });
}
```

---

## **Diagrama del Flujo Seguro:**

```
┌─────────────────────────────────────────────────────────┐
│ CLIENTE (Frontend)                                      │
│ - Ve precio: $450                                       │
│ - Envía: producto_id=123, cantidad=1                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ BACKEND (Node.js)                                       │
│ 1. Recibe: producto_id=123                              │
│ 2. Consulta BD: SELECT precio FROM productos WHERE id=123│
│ 3. Obtiene: precio=$450 (de la BD, no del cliente)     │
│ 4. Calcula: total = $450 * 1 = $450                    │
│ 5. Crea orden con precio REAL                           │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ MERCADO PAGO                                            │
│ - Recibe preferencia con monto: $450                   │
│ - Procesa pago: $450                                    │
└─────────────────────────────────────────────────────────┘
```

---

## **Testing: Verificar que Funciona**

### **Test 1: Intentar Modificar Precio**

```javascript
// En DevTools del navegador
// Modificar precio antes de enviar
const payload = {
  items: [{
    producto_id: 1,
    precio_unitario: 1 // ← Intentar pagar $1 por algo de $450
  }]
};

fetch('/api/ordenes', {
  method: 'POST',
  body: JSON.stringify(payload)
});

// Resultado esperado:
// ❌ Error 400: "Los precios han cambiado"
```

### **Test 2: Verificar Logs**

```bash
# En consola del servidor
⚠️ Manipulación de precio detectada:
{
  producto_id: 1,
  precioReal: 450,
  precioCliente: 1,
  diferencia: 449
}
```

---

## **Checklist de Seguridad:**

- [ ] Backend consulta precios desde BD
- [ ] Backend NO confía en precios del frontend
- [ ] Backend calcula total
- [ ] Backend compara total calculado vs. total recibido
- [ ] Frontend solo envía IDs de productos
- [ ] Logs registran intentos de manipulación
- [ ] Tests verifican que rechazan precios manipulados

**Si todo está ✅, tus precios están protegidos.**
