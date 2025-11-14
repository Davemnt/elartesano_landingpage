<?php
/**
 * Configuración segura para el formulario de contacto
 * El Artesano - Panadería Artesanal
 */

// Configuración de seguridad
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Solo permitir métodos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Configuración de email (MANTENER ESTO PRIVADO)
// IMPORTANTE: Este archivo debe estar fuera del directorio público o en un servidor seguro
$config = [
    // Email de destino (tu email real aquí)
    'to_email' => 'tu-email@ejemplo.com', // CAMBIAR POR TU EMAIL REAL
    'to_name' => 'El Artesano - Panadería',
    
    // Configuración SMTP (usar un servicio como Gmail, SendGrid, etc.)
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'tu-email@gmail.com', // CAMBIAR POR TU EMAIL REAL
    'smtp_password' => 'tu-app-password', // USAR APP PASSWORD DE GMAIL
    'smtp_secure' => 'tls',
    
    // Configuración de seguridad
    'max_message_length' => 2000,
    'allowed_domains' => [], // Dejar vacío para permitir todos los dominios
    'rate_limit_per_ip' => 5, // Máximo 5 mensajes por IP por hora
];

// Verificar CSRF Token (implementación básica)
session_start();

if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || 
    !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido']);
    exit;
}

// Rate limiting básico
$ip = $_SERVER['REMOTE_ADDR'];
$rate_limit_file = sys_get_temp_dir() . '/contact_rate_' . md5($ip);

if (file_exists($rate_limit_file)) {
    $attempts = json_decode(file_get_contents($rate_limit_file), true);
    $current_hour = date('Y-m-d-H');
    
    if (isset($attempts[$current_hour]) && $attempts[$current_hour] >= $config['rate_limit_per_ip']) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Demasiados intentos. Intente más tarde.']);
        exit;
    }
}

// Validación y sanitización de datos
function sanitize_input($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function validate_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validate_phone($phone) {
    return preg_match('/^[\+]?[0-9\s\-\(\)]{7,20}$/', $phone);
}

// Obtener y validar datos
$nombre = sanitize_input($_POST['nombre'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$telefono = sanitize_input($_POST['telefono'] ?? '');
$mensaje = sanitize_input($_POST['mensaje'] ?? '');

// Validaciones
$errors = [];

if (empty($nombre) || strlen($nombre) < 2) {
    $errors[] = 'El nombre es requerido y debe tener al menos 2 caracteres';
}

if (empty($email) || !validate_email($email)) {
    $errors[] = 'Email inválido';
}

if (!empty($telefono) && !validate_phone($telefono)) {
    $errors[] = 'Teléfono inválido';
}

if (empty($mensaje) || strlen($mensaje) < 10) {
    $errors[] = 'El mensaje es requerido y debe tener al menos 10 caracteres';
}

if (strlen($mensaje) > $config['max_message_length']) {
    $errors[] = 'El mensaje es demasiado largo';
}

// Filtro anti-spam básico
$spam_patterns = [
    '/\b(viagra|cialis|casino|poker|loan|mortgage)\b/i',
    '/(http|https):\/\/[^\s]+/i', // URLs
    '/\b[A-Z]{5,}\b/', // Muchas mayúsculas
];

foreach ($spam_patterns as $pattern) {
    if (preg_match($pattern, $mensaje . ' ' . $nombre)) {
        $errors[] = 'Mensaje detectado como spam';
        break;
    }
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Importar PHPMailer (asegúrate de tener PHPMailer instalado)
require_once 'vendor/autoload.php'; // Si usas Composer
// O incluye PHPMailer manualmente:
// require_once 'PHPMailer/src/PHPMailer.php';
// require_once 'PHPMailer/src/SMTP.php';
// require_once 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);
    
    // Configuración SMTP
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port = $config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    
    // Configuración del email
    $mail->setFrom($config['smtp_username'], 'El Artesano - Formulario de Contacto');
    $mail->addAddress($config['to_email'], $config['to_name']);
    $mail->addReplyTo($email, $nombre);
    
    // Contenido del email
    $mail->isHTML(true);
    $mail->Subject = 'Nuevo mensaje desde El Artesano - ' . $nombre;
    
    $html_body = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ede8d0; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #1a1a1a; }
            .footer { margin-top: 30px; padding: 20px; background: #1a1a1a; color: #ede8d0; text-align: center; border-radius: 10px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h2 style='color: #1a1a1a; margin: 0;'>El Artesano - Panadería Artesanal</h2>
                <p style='margin: 5px 0 0 0; color: #666;'>Nuevo mensaje de contacto</p>
            </div>
            <div class='content'>
                <div class='field'>
                    <div class='label'>Nombre:</div>
                    <div>" . htmlspecialchars($nombre) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Email:</div>
                    <div>" . htmlspecialchars($email) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Teléfono:</div>
                    <div>" . (!empty($telefono) ? htmlspecialchars($telefono) : 'No proporcionado') . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Mensaje:</div>
                    <div>" . nl2br(htmlspecialchars($mensaje)) . "</div>
                </div>
                <div class='field'>
                    <div class='label'>Información adicional:</div>
                    <div>
                        <strong>Fecha:</strong> " . date('d/m/Y H:i:s') . "<br>
                        <strong>IP:</strong> " . $_SERVER['REMOTE_ADDR'] . "<br>
                        <strong>User Agent:</strong> " . htmlspecialchars($_SERVER['HTTP_USER_AGENT']) . "
                    </div>
                </div>
            </div>
            <div class='footer'>
                <p>Este mensaje fue enviado desde el formulario de contacto de El Artesano</p>
                <p style='font-size: 12px; margin-top: 10px;'>Responde directamente a este email para contactar al cliente</p>
            </div>
        </div>
    </body>
    </html>";
    
    $mail->Body = $html_body;
    
    // Versión en texto plano
    $mail->AltBody = "
    Nuevo mensaje de contacto - El Artesano
    
    Nombre: $nombre
    Email: $email
    Teléfono: " . (!empty($telefono) ? $telefono : 'No proporcionado') . "
    
    Mensaje:
    $mensaje
    
    ---
    Enviado el: " . date('d/m/Y H:i:s') . "
    IP: " . $_SERVER['REMOTE_ADDR'] . "
    ";
    
    // Enviar email
    $mail->send();
    
    // Registrar intento exitoso para rate limiting
    $current_hour = date('Y-m-d-H');
    $attempts = [];
    if (file_exists($rate_limit_file)) {
        $attempts = json_decode(file_get_contents($rate_limit_file), true);
    }
    $attempts[$current_hour] = ($attempts[$current_hour] ?? 0) + 1;
    file_put_contents($rate_limit_file, json_encode($attempts));
    
    // Respuesta exitosa
    echo json_encode([
        'success' => true,
        'message' => 'Mensaje enviado correctamente. Te contactaremos pronto.'
    ]);
    
} catch (Exception $e) {
    // Log del error (no mostrar detalles al usuario)
    error_log("Error enviando email desde formulario de contacto: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor. Intente más tarde o contáctenos directamente.'
    ]);
}
?>