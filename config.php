<?php
/**
 * Configuración de Email Simplificada - El Artesano
 * Para usar con mail() nativo de PHP
 */

return [
    // Configuración de Email
    'email' => [
        'to_email' => 'tumail@gmail.com',  // CAMBIAR por tu email real
        'smtp_username' => 'noreply@elartesano.com',  // Email que aparecerá como remitente
    ],
    
    // Configuración de Seguridad
    'security' => [
        'rate_limit_per_ip' => 5,          // Máximo 5 emails por IP por hora
        'max_message_length' => 2000,      // Máximo caracteres en mensaje
        'log_attempts' => true,            // Registrar intentos en log
        'require_csrf' => false,           // Para desarrollo (cambiar a true en producción)
    ],
    
    // Notificaciones WhatsApp (opcional)
    'whatsapp' => [
        'enabled' => false,
        'number' => '+1234567890',         // Tu número de WhatsApp
    ]
];

/* 
INSTRUCCIONES DE CONFIGURACIÓN:

1. GMAIL SETUP (Recomendado):
   - Habilita verificación en 2 pasos en tu cuenta Google
   - Genera una "Contraseña de aplicación" específica
   - Usa esa contraseña en 'smtp_password'
   - Tutorial: https://support.google.com/accounts/answer/185833

2. PERMISOS DE ARCHIVO:
   chmod 600 config.php (solo el propietario puede leer/escribir)

3. UBICACIÓN SEGURA:
   - Idealmente, mover este archivo fuera del directorio público
   - Ejemplo: /home/usuario/config/contact-config.php
   - Actualizar la ruta en contact.php

4. TESTING:
   - Probar primero en un entorno local
   - Verificar logs del servidor para errores
   - Confirmar recepción de emails

5. PRODUCCIÓN:
   - Usar HTTPS siempre
   - Implementar reCAPTCHA si hay mucho spam
   - Monitorear logs regularmente
*/
?>