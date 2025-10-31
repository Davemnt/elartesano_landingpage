# 🧪 GUÍA DE PRUEBAS - EL ARTESANO E-COMMERCE

## Comandos de PowerShell para Probar la API

### 1. Health Check
```powershell
curl http://localhost:3000/health
```

### 2. Listar Productos (público)
```powershell
curl http://localhost:3000/api/productos
```

### 3. Ver un Producto
```powershell
curl http://localhost:3000/api/productos/PRODUCT_ID_AQUI
```

### 4. Registrar Usuario
```powershell
$body = @{
    email = "test@test.com"
    password = "Test123!"
    nombre = "Usuario Test"
    telefono = "+5491112345678"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/auth/registro `
  -H "Content-Type: application/json" `
  -d $body
```

### 5. Login (guarda el token)
```powershell
$loginBody = @{
    email = "admin@elartesano.com"
    password = "Admin123!"
} | ConvertTo-Json

$response = curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $loginBody | ConvertFrom-Json

$token = $response.data.token
echo "Token guardado: $token"
```

### 6. Obtener Usuario Actual (requiere token)
```powershell
curl http://localhost:3000/api/auth/me `
  -H "Authorization: Bearer $token"
```

### 7. Crear Producto (admin)
```powershell
$productoBody = @{
    nombre = "Pan Integral"
    descripcion = "Pan integral artesanal con semillas"
    precio = 150
    categoria = "Panes"
    stock = 20
    imagen_url = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600"
} | ConvertTo-Json

curl -X POST http://localhost:3000/api/productos `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $productoBody
```

### 8. Listar Cursos
```powershell
curl http://localhost:3000/api/cursos
```

---

## Usando Postman / Thunder Client

### Registro
```http
POST http://localhost:3000/api/auth/registro
Content-Type: application/json

{
  "email": "cliente@test.com",
  "password": "Cliente123!",
  "nombre": "María González",
  "telefono": "+5491123456789"
}
```

### Login Admin
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@elartesano.com",
  "password": "Admin123!"
}
```

**Copia el `token` de la respuesta y úsalo en el header `Authorization: Bearer TOKEN`**

### Crear Producto
```http
POST http://localhost:3000/api/productos
Authorization: Bearer COPIA_EL_TOKEN_AQUI
Content-Type: application/json

{
  "nombre": "Medialunas de Manteca",
  "descripcion": "Medialunas artesanales recién horneadas",
  "precio": 80,
  "categoria": "Facturas",
  "stock": 50,
  "destacado": true,
  "imagen_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"
}
```

### Actualizar Producto
```http
PUT http://localhost:3000/api/productos/PRODUCT_ID
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "precio": 90,
  "stock": 45
}
```

### Desactivar Producto (Soft Delete)
```http
DELETE http://localhost:3000/api/productos/PRODUCT_ID
Authorization: Bearer TOKEN
```

---

## Verificar en Supabase

1. Ve a tu proyecto: https://supabase.com/dashboard/project/TU_PROYECTO
2. Table Editor
3. Verifica las tablas:

### Tabla `usuarios`
- Busca `admin@elartesano.com`
- Busca los usuarios de prueba creados

### Tabla `productos`
- Deberías ver 6 productos iniciales
- Más los que hayas creado vía API

### Tabla `cursos`
- 3 cursos de ejemplo

---

## Próximos Pasos

Una vez que hayas probado el backend, elige qué implementar:

**A** = Sistema de Órdenes + Mercado Pago
**B** = Frontend con Login/Registro
**C** = Todo junto

Escribe la letra en el chat 🚀
