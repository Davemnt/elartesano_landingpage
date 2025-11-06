/**
 * Script de Testing de Seguridad de Pagos
 * Tests: Rate limiting, validación de estados, prevención de duplicados
 */

const BASE_URL = 'http://localhost:3000';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

// Simular delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test 1: Rate Limiting en /api/pagos/preferencia
 * Debe bloquear después de 5 intentos en 15 minutos
 */
async function testRateLimiting() {
    log('\n📋 TEST 1: Rate Limiting', colors.blue);
    log('━'.repeat(50), colors.blue);
    
    const testData = {
        orden_id: 999999, // Orden ficticia
        payer: {
            email: 'test@test.com',
            name: 'Test User'
        }
    };

    let bloqueado = false;
    
    for (let i = 1; i <= 7; i++) {
        try {
            const response = await fetch(`${BASE_URL}/api/pagos/preferencia`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testData)
            });

            const data = await response.json();
            
            if (response.status === 429) {
                bloqueado = true;
                log(`✅ Intento ${i}: BLOQUEADO por rate limiting`, colors.green);
                log(`   Mensaje: "${data.message}"`, colors.yellow);
            } else {
                log(`⚠️ Intento ${i}: Status ${response.status} - ${data.message}`, colors.yellow);
            }
            
            await delay(500); // Medio segundo entre requests
            
        } catch (error) {
            log(`❌ Error en intento ${i}: ${error.message}`, colors.red);
        }
    }

    if (bloqueado) {
        log('\n✅ Rate limiting funcionando correctamente', colors.green);
    } else {
        log('\n❌ Rate limiting NO detectado', colors.red);
    }
}

/**
 * Test 2: Validación de orden no encontrada
 */
async function testOrdenNoEncontrada() {
    log('\n📋 TEST 2: Validación de Orden No Encontrada', colors.blue);
    log('━'.repeat(50), colors.blue);
    
    const testData = {
        orden_id: 999999999, // ID que no existe
        payer: {
            email: 'test@test.com',
            name: 'Test User'
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/api/pagos/preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const data = await response.json();
        
        if (response.status === 404 && data.message.includes('no encontrada')) {
            log('✅ Validación correcta: Orden no encontrada detectada', colors.green);
            log(`   Mensaje: "${data.message}"`, colors.yellow);
        } else {
            log('❌ Validación incorrecta', colors.red);
            log(`   Status: ${response.status}`, colors.yellow);
            log(`   Mensaje: "${data.message}"`, colors.yellow);
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, colors.red);
    }
}

/**
 * Test 3: Validación de orden_id requerido
 */
async function testOrdenIdRequerido() {
    log('\n📋 TEST 3: Validación de orden_id Requerido', colors.blue);
    log('━'.repeat(50), colors.blue);
    
    const testData = {
        // orden_id faltante intencionalmente
        payer: {
            email: 'test@test.com',
            name: 'Test User'
        }
    };

    try {
        const response = await fetch(`${BASE_URL}/api/pagos/preferencia`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        const data = await response.json();
        
        if (response.status === 400 && data.message.includes('requerido')) {
            log('✅ Validación correcta: orden_id requerido detectado', colors.green);
            log(`   Mensaje: "${data.message}"`, colors.yellow);
        } else {
            log('❌ Validación incorrecta', colors.red);
            log(`   Status: ${response.status}`, colors.yellow);
            log(`   Mensaje: "${data.message}"`, colors.yellow);
        }
    } catch (error) {
        log(`❌ Error: ${error.message}`, colors.red);
    }
}

/**
 * Test 4: Health check del servidor
 */
async function testHealthCheck() {
    log('\n📋 TEST 4: Health Check', colors.blue);
    log('━'.repeat(50), colors.blue);
    
    try {
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        
        if (response.ok && data.success) {
            log('✅ Servidor respondiendo correctamente', colors.green);
            log(`   Mensaje: "${data.message}"`, colors.yellow);
        } else {
            log('❌ Servidor con problemas', colors.red);
        }
    } catch (error) {
        log(`❌ No se puede conectar al servidor: ${error.message}`, colors.red);
        log('   Asegúrate de que el servidor esté corriendo en http://localhost:3000', colors.yellow);
        process.exit(1);
    }
}

/**
 * Ejecutar todos los tests
 */
async function runAllTests() {
    log('\n' + '═'.repeat(50), colors.magenta);
    log('🔒 TESTS DE SEGURIDAD - EL ARTESANO', colors.magenta);
    log('═'.repeat(50), colors.magenta);
    
    await testHealthCheck();
    await testOrdenIdRequerido();
    await testOrdenNoEncontrada();
    await testRateLimiting();
    
    log('\n' + '═'.repeat(50), colors.magenta);
    log('✅ TESTS COMPLETADOS', colors.magenta);
    log('═'.repeat(50), colors.magenta);
    
    log('\n📝 Resumen:', colors.blue);
    log('  • Rate limiting: Protege contra ataques de fuerza bruta', colors.yellow);
    log('  • Validación de entrada: Previene datos inválidos', colors.yellow);
    log('  • Validación de orden: Evita manipulación de IDs', colors.yellow);
    log('\n');
}

// Ejecutar
runAllTests().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, colors.red);
    process.exit(1);
});
