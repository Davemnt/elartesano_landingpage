<?php
/**
 * Procesador de Contacto Simplificado - El Artesano
 * Versión que usa mail() nativo de PHP (más compatible)
 */

// Configuración de seguridad
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Cargar configuración
$config = include 'config.php';

// Verificar que el servidor puede enviar emails
if (!function_exists('mail')) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Servicio de email no disponible']);
    exit;
}

// CSRF Protection básico
session_start();
if (!isset($_POST['csrf_token']) || !isset($_SESSION['csrf_token']) || 
    !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    
    // Para desarrollo, permitir sin token si no está configurado
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    // En producción, descomenta las siguientes líneas:
    // http_response_code(403);
    // echo json_encode(['success' => false, 'message' => 'Token de seguridad inválido']);
    // exit;
}

// Rate limiting simple
$ip = $_SERVER['REMOTE_ADDR'];
$rate_file = sys_get_temp_dir() . '/contact_' . md5($ip . date('Y-m-d-H'));

if (file_exists($rate_file)) {
    $attempts = (int) file_get_contents($rate_file);
    if ($attempts >= $config['security']['rate_limit_per_ip']) {
        http_response_code(429);
        echo json_encode(['success' => false, 'message' => 'Demasiados intentos. Espere una hora.']);
        exit;
    }
} else {
    $attempts = 0;
}

// Funciones de validación
function sanitize_input($data) {
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

function is_valid_email($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function is_valid_phone($phone) {
    return empty($phone) || preg_match('/^[\+]?[0-9\s\-\(\)]{7,20}$/', $phone);
}

// Validar honeypot (campo oculto anti-bot)
if (!empty($_POST['website'])) { // Campo que debe estar vacío
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Bot detectado']);
    exit;
}

// Obtener y validar datos
$nombre = sanitize_input($_POST['nombre'] ?? '');
$email = sanitize_input($_POST['email'] ?? '');
$telefono = sanitize_input($_POST['telefono'] ?? '');
$mensaje = sanitize_input($_POST['mensaje'] ?? '');

// Validaciones
$errors = [];

if (empty($nombre) || strlen($nombre) < 2 || strlen($nombre) > 100) {
    $errors[] = 'Nombre inválido (2-100 caracteres)';
}

if (empty($email) || !is_valid_email($email)) {
    $errors[] = 'Email inválido';
}

if (!is_valid_phone($telefono)) {
    $errors[] = 'Teléfono inválido';
}

if (empty($mensaje) || strlen($mensaje) < 10) {
    $errors[] = 'Mensaje muy corto (mínimo 10 caracteres)';
}

if (strlen($mensaje) > $config['security']['max_message_length']) {
    $errors[] = 'Mensaje demasiado largo';
}

// Filtros anti-spam
$spam_words = ['viagra', 'casino', 'loan', 'bitcoin', 'invest', 'opportunity', 'click here'];
$text_to_check = strtolower($nombre . ' ' . $mensaje);

foreach ($spam_words as $spam_word) {
    if (strpos($text_to_check, $spam_word) !== false) {
        $errors[] = 'Contenido no permitido';
        break;
    }
}

// URLs en el mensaje (posible spam)
if (preg_match('/(http|https|www\.)/i', $mensaje)) {
    $errors[] = 'No se permiten enlaces';
}

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Preparar email
$to_email = $config['email']['to_email'];
$subject = 'Nuevo contacto desde El Artesano - ' . $nombre;

// Headers seguros para evitar injection
$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: ' . $config['email']['smtp_username'],
    'Reply-To: ' . $email,
    'Return-Path: ' . $config['email']['smtp_username'],
    'X-Mailer: PHP/' . phpversion(),
    'X-Priority: 3',
    'X-IP: ' . $_SERVER['REMOTE_ADDR'],
];

$headers_string = implode("\r\n", $headers);

// Plantilla HTML del email
$html_message = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ede8d0 0%, #d4c5a9 100%); padding: 30px; text-align: center; }
        .header h1 { color: #1a1a1a; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 10px 0 0 0; }
        .content { padding: 30px; }
        .field { background: #f9f9f9; margin-bottom: 20px; padding: 15px; border-radius: 8px; border-left: 4px solid #ede8d0; }
        .field-label { font-weight: bold; color: #1a1a1a; margin-bottom: 8px; }
        .field-value { color: #333; }
        .message-content { background: white; padding: 20px; border-radius: 8px; border: 2px solid #ede8d0; }
        .footer { background: #1a1a1a; color: #ede8d0; padding: 20px; text-align: center; }
        .footer p { margin: 0; font-size: 14px; }
        .info { font-size: 12px; color: #999; margin-top: 15px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🥖 El Artesano</h1>
            <p>Nuevo mensaje de contacto</p>
        </div>
        
        <div class='content'>
            <div class='field'>
                <div class='field-label'>👤 Nombre:</div>
                <div class='field-value'>" . htmlspecialchars($nombre) . "</div>
            </div>
            
            <div class='field'>
                <div class='field-label'>📧 Email:</div>
                <div class='field-value'><a href='mailto:" . htmlspecialchars($email) . "'>" . htmlspecialchars($email) . "</a></div>
            </div>
            
            <div class='field'>
                <div class='field-label'>📱 Teléfono:</div>
                <div class='field-value'>" . (!empty($telefono) ? htmlspecialchars($telefono) : 'No proporcionado') . "</div>
            </div>
            
            <div class='field'>
                <div class='field-label'>💬 Mensaje:</div>
                <div class='message-content'>" . nl2br(htmlspecialchars($mensaje)) . "</div>
            </div>
            
            <div class='info'>
                <strong>📅 Fecha:</strong> " . date('d/m/Y H:i:s T') . "<br>
                <strong>🌐 IP:</strong> " . $_SERVER['REMOTE_ADDR'] . "<br>
                <strong>🔍 Navegador:</strong> " . htmlspecialchars(substr($_SERVER['HTTP_USER_AGENT'], 0, 100)) . "
            </div>
        </div>
        
        <div class='footer'>
            <p>📧 Responde directamente a este email para contactar al cliente</p>
            <p>🏪 Mensaje enviado desde el sitio web de El Artesano</p>
        </div>
    </div>
</body>
</html>";

// Intentar enviar el email
if (mail($to_email, $subject, $html_message, $headers_string)) {
    // Incrementar contador de rate limiting
    file_put_contents($rate_file, $attempts + 1);
    
    // Log exitoso (opcional)
    if ($config['security']['log_attempts']) {
        $log_entry = date('Y-m-d H:i:s') . " - Contacto exitoso de: $email ($nombre) - IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
        file_put_contents('logs/contact.log', $log_entry, FILE_APPEND | LOCK_EX);
    }
    
    echo json_encode([
        'success' => true,
        'message' => '¡Mensaje enviado correctamente! Te contactaremos pronto.'
    ]);
    
} else {
    // Error enviando email
    error_log("Error enviando email desde formulario de contacto - From: $email");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error enviando el mensaje. Por favor, intenta más tarde o contáctanos directamente.'
    ]);
}
?>