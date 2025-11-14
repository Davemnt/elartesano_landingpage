# 📧 Configuración del Formulario de Contacto - El Artesano

## 🎯 Configuración Inmediata

### 1. Configurar Email de Destino

Edita el archivo `config.php` y cambia:

```php
'to_email' => 'tumail@gmail.com',  // ← CAMBIA POR TU EMAIL REAL
```

Por ejemplo:
```php
'to_email' => 'contacto@elartesano.com',
```

### 2. Subir Archivos al Servidor

Sube estos archivos a tu servidor web con PHP:

- ✅ `config.php`
- ✅ `send-contact.php`
- ✅ `index.html` (actualizado)
- ✅ `style.css` (actualizado)
- ✅ `app.js` (actualizado)
- ✅ Carpeta `logs/` (vacía)

### 3. Configurar Permisos

En tu servidor, ejecuta:
```bash
chmod 755 send-contact.php
chmod 600 config.php
chmod 755 logs/
```

## 🔧 Configuración Avanzada (Opcional)

### Para Gmail con SMTP

Si quieres usar SMTP en lugar de mail(), necesitas:

1. **Habilitar 2FA en Gmail**
2. **Generar App Password**
3. **Instalar PHPMailer**
4. **Usar `contact.php` en lugar de `send-contact.php`**

### Instalar PHPMailer

```bash
composer require phpmailer/phpmailer
```

## 🧪 Cómo Probar

### 1. Prueba Local (con servidor PHP local)

```bash
# En la carpeta del proyecto
php -S localhost:8080
```

Luego ve a: `http://localhost:8080`

### 2. Prueba en Servidor Web

1. Sube archivos a tu hosting
2. Visita tu sitio web
3. Llena el formulario de contacto
4. Verifica que llegue el email

## 🔒 Seguridad Implementada

✅ **Protección CSRF** - Token de seguridad  
✅ **Rate Limiting** - Máximo 5 emails por IP/hora  
✅ **Honeypot** - Campo oculto anti-bot  
✅ **Sanitización** - Limpia datos de entrada  
✅ **Validación** - Verifica formato de email/teléfono  
✅ **Anti-Spam** - Detecta palabras spam y URLs  
✅ **Logs** - Registra intentos para auditoría  

## 🛠️ Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `send-contact.php` | Procesador simple con mail() nativo |
| `contact.php` | Procesador avanzado con PHPMailer |
| `config.php` | Configuración de email y seguridad |
| `logs/` | Carpeta para logs de contacto |

## ⚡ Ventajas de Esta Implementación

- **✅ Simple**: Usa mail() nativo de PHP
- **✅ Compatible**: Funciona en la mayoría de hostings
- **✅ Seguro**: Múltiples capas de protección
- **✅ Responsive**: Mensajes elegantes en HTML
- **✅ WhatsApp**: Integración opcional
- **✅ Logs**: Para auditoría y debugging

## 🚨 Troubleshooting

### Email no llega
1. Verifica que tu hosting permita `mail()`
2. Revisa la carpeta de SPAM
3. Comprueba los logs del servidor
4. Verifica el email en `config.php`

### Error 500
1. Revisa permisos de archivos
2. Verifica sintaxis de PHP
3. Comprueba logs de error del servidor

### Formulario no responde
1. Verifica que `send-contact.php` existe
2. Comprueba consola del navegador (F12)
3. Verifica que JavaScript no tenga errores

## 📞 Soporte

Si necesitas ayuda adicional:
- Revisa los logs en `/logs/contact.log`
- Verifica la configuración en `config.php`
- Comprueba que el servidor tenga PHP habilitado

¡Tu formulario de contacto está listo y seguro! 🚀