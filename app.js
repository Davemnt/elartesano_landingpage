// El Artesano - JavaScript principal
// =====================================

// Inicialización optimizada
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes críticos inmediatamente
    initializeNavbar();
    initializeSmoothScrolling();
    
    // Inicializar componentes no críticos después de un pequeño delay
    setTimeout(function() {
        initializeContactForm();
        initializeProductos();
        initializeAOS();
    }, 100);
});

// Función principal de inicialización optimizada
function initializeWebsite() {
    console.log('🥖 El Artesano - Sitio web listo');
}

// =====================================
// NAVEGACIÓN Y NAVBAR
// =====================================

function initializeNavbar() {
    // Efecto de scroll en navbar
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Activar enlace según sección visible
    window.addEventListener('scroll', updateActiveNavLink);
}

function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

function toggleMobileMenu() {
    const navbarNav = document.getElementById('navbarNav');
    navbarNav.classList.toggle('show');
}

// =====================================
// NAVEGACIÓN SUAVE
// =====================================

function initializeSmoothScrolling() {
    // Scroll suave para enlaces de ancla
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Cerrar menú móvil si está abierto
                const navbarNav = document.getElementById('navbarNav');
                if (navbarNav.classList.contains('show')) {
                    navbarNav.classList.remove('show');
                }
            }
        });
    });
}

// =====================================
// PRODUCTOS
// =====================================

function initializeProductos() {
    cargarProductos();
}

function cargarProductos() {
    console.log('🍞 Cargando productos...');
    
    const container = document.getElementById('productos-container');
    if (!container) {
        console.error('❌ Contenedor de productos no encontrado');
        return;
    }

    // Productos estáticos de la panadería
    const productos = [
        {
            nombre: "Tortas artesanales",
            descripcion: "Pan elaborado con harina integral y semillas, horneado diariamente con masa madre natural.",
            imagen: "img/torta.jpg",
            destacado: true
        },
        {
            nombre: "Sandwichs de miga",
            descripcion: "Deliciosos sandwich de miga, siguiendo la receta tradicional.",
            imagen: "img/sandwich-miga.jpg"
        },
        {
            nombre: "Facturas Argentinas",
            descripcion: "Variedad de facturas tradicionales: medialunas, vigilantes, cañoncitos y más.",
            imagen: "img/facturas.jpg"
        },
        {
            nombre: "Pan de Campo",
            descripcion: "Pan rústico horneado en horno de leña, con corteza crocante y miga esponjosa.",
            imagen: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop"
        },
        {
            nombre: "Masas Secas",
            descripcion: "Tortas artesanales elaboradas con ingredientes frescos y recetas familiares.",
            imagen: "img/masas secas.jpg"
        },
        {
            nombre: "Empanadas Criollas",
            descripcion: "Empanadas hechas con masa casera y rellenos tradicionales: carne, pollo, jamón y queso.",
            imagen: "https://images.unsplash.com/photo-1625938145312-e8b5ee615b87?w=400&h=300&fit=crop"
        }
    ];

    // Generar HTML de productos con lazy loading
    container.innerHTML = productos.map((producto, index) => `
        <div class="product-card" data-aos="zoom-in" data-aos-delay="${Math.min((index + 1) * 100, 600)}">
            <div class="product-image">
                <img src="${producto.imagen}" 
                     alt="${producto.nombre}"
                     loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300/8b4513/ffffff?text=${encodeURIComponent(producto.nombre)}'">
                ${producto.destacado ? '<span class="badge-destacado">Destacado</span>' : ''}
            </div>
            <div class="product-info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion}</p>
                <button class="btn-ver-mas" onclick="verProducto('${producto.nombre.replace(/'/g, "\\'")}', '${producto.descripcion.replace(/'/g, "\\'")}')">
                    <i class="ri-eye-line"></i> Ver Más Detalles
                </button>
            </div>
        </div>
    `).join('');

    console.log(`✅ Se cargaron ${productos.length} productos correctamente`);

    // Reinicializar animaciones AOS para nuevos elementos
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}

function verProducto(nombre, descripcion) {
    // Crear modal personalizado
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.innerHTML = `
        <div class="product-modal-content">
            <div class="product-modal-header">
                <h3>${nombre}</h3>
                <button class="close-modal" onclick="cerrarModalProducto()">&times;</button>
            </div>
            <div class="product-modal-body">
                <p>${descripcion}</p>
                <div class="product-highlight">
                    <i class="ri-star-fill"></i>
                    <span>Producto artesanal elaborado con ingredientes de primera calidad</span>
                </div>
                <div class="contact-info">
                    <p><strong>📞 Contáctanos para consultar disponibilidad y realizar tu pedido:</strong></p>
                    <div class="contact-buttons">
                        <a href="https://wa.me/5491112345678?text=Hola! Me interesa el ${encodeURIComponent(nombre)}" 
                           target="_blank" class="btn-whatsapp">
                            <i class="ri-whatsapp-fill"></i> WhatsApp
                        </a>
                        <a href="tel:+541112345678" class="btn-phone">
                            <i class="ri-phone-fill"></i> Llamar
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar estilos del modal si no existen
    if (!document.querySelector('#product-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'product-modal-styles';
        styles.innerHTML = `
            .product-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                animation: fadeIn 0.3s ease;
            }
            
            .product-modal-content {
                background: white;
                border-radius: 15px;
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .product-modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .product-modal-header h3 {
                color: var(--color-secondary);
                margin: 0;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 2rem;
                cursor: pointer;
                color: var(--color-secondary);
            }
            
            .product-modal-body {
                padding: 20px;
            }
            
            .product-highlight {
                background: var(--color-primary);
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .product-highlight i {
                color: #ffc107;
                font-size: 1.2rem;
            }
            
            .contact-buttons {
                display: flex;
                gap: 15px;
                margin-top: 15px;
            }
            
            .btn-whatsapp, .btn-phone {
                flex: 1;
                padding: 12px 20px;
                border-radius: 25px;
                text-decoration: none;
                text-align: center;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .btn-whatsapp {
                background: #25d366;
                color: white;
            }
            
            .btn-whatsapp:hover {
                background: #128C7E;
                color: white;
            }
            
            .btn-phone {
                background: var(--color-secondary);
                color: white;
            }
            
            .btn-phone:hover {
                background: var(--color-accent);
                color: white;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            cerrarModalProducto();
        }
    });
}

function cerrarModalProducto() {
    const modal = document.querySelector('.product-modal');
    if (modal) {
        modal.remove();
    }
}

// =====================================
// FORMULARIO DE CONTACTO
// =====================================

function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    const cursosForm = document.getElementById('cursosForm');
    if (cursosForm) {
        cursosForm.addEventListener('submit', handleCursosFormSubmit);
    }
}

function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('#submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const messageDiv = form.querySelector('#formMessage');
    
    // Mostrar estado de carga
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    submitBtn.disabled = true;
    
    // Ocultar mensaje anterior
    messageDiv.style.display = 'none';
    
    // Enviar formulario por fetch
    fetch('send-contact.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Restaurar botón
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        
        // Mostrar mensaje de respuesta
        messageDiv.style.display = 'block';
        messageDiv.textContent = data.message;
        
        if (data.success) {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
            
            // Reset formulario
            form.reset();
            
            // Opcional: Ofrecer WhatsApp
            const nombre = formData.get('nombre');
            const mensaje = formData.get('mensaje');
            const mensajeWhatsApp = `Hola! Soy ${nombre}. ${mensaje}`;
            const whatsappURL = `https://wa.me/5491112345678?text=${encodeURIComponent(mensajeWhatsApp)}`;
            
            setTimeout(() => {
                if (confirm('¿Te gustaría también contactarnos por WhatsApp?')) {
                    window.open(whatsappURL, '_blank');
                }
            }, 1500);
            
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }
        
        // Ocultar mensaje después de 5 segundos
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
        
    })
    .catch(error => {
        console.error('Error:', error);
        
        // Restaurar botón
        btnText.style.display = 'inline-block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;
        
        // Mostrar error
        messageDiv.style.display = 'block';
        messageDiv.style.backgroundColor = '#f8d7da';
        messageDiv.style.color = '#721c24';
        messageDiv.style.border = '1px solid #f5c6cb';
        messageDiv.textContent = 'Error de conexión. Por favor, intenta nuevamente o contáctanos por WhatsApp.';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    });
}

function handleCursosFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nombre = formData.get('nombre');
    const email = formData.get('email');
    const telefono = formData.get('telefono') || 'No especificado';
    const curso = formData.get('curso');
    const mensaje = formData.get('mensaje') || '';
    
    // Obtener nombre del curso seleccionado
    const cursoNames = {
        'principiante': 'Curso Principiante',
        'intermedio': 'Curso Intermedio', 
        'avanzado': 'Curso Avanzado',
        'todos': 'Información sobre todos los cursos'
    };
    
    const cursoSeleccionado = cursoNames[curso] || curso;
    
    // Simular envío de formulario
    const submitBtn = e.target.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> Enviando...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Mostrar mensaje de éxito
        mostrarNotificacion('✅ Solicitud enviada correctamente. Te contactaremos pronto con información sobre los cursos!', 'success');
        
        // Reset formulario
        e.target.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Crear mensaje personalizado para WhatsApp
        const mensajeWhatsApp = `Hola! Soy ${nombre}. Me interesa información sobre: ${cursoSeleccionado}. ${mensaje ? 'Comentario adicional: ' + mensaje : ''} Mi email: ${email}, teléfono: ${telefono}`;
        const whatsappURL = `https://wa.me/5491112345678?text=${encodeURIComponent(mensajeWhatsApp)}`;
        
        setTimeout(() => {
            if (confirm('¿Te gustaría recibir información inmediata por WhatsApp?')) {
                window.open(whatsappURL, '_blank');
            }
        }, 1000);
        
    }, 1500);
}

// =====================================
// ANIMACIONES AOS
// =====================================

function initializeAOS() {
    // Verificar si AOS está disponible con reintentos
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryInitAOS() {
        if (typeof AOS !== 'undefined' && AOS.init) {
            AOS.init({
                duration: 400, // Reducir duración para mejor rendimiento
                once: true,
                offset: 30,
                disable: window.innerWidth < 768 ? true : false, // Deshabilitar en móviles
                throttleDelay: 99,
                debounceDelay: 50,
                startEvent: 'load' // Iniciar después de que la página cargue
            });
            console.log('✅ AOS inicializado');
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryInitAOS, 100);
        } else {
            console.log('⚠️ AOS no disponible - continuando sin animaciones');
        }
    }
    
    tryInitAOS();
}

// =====================================
// UTILIDADES
// =====================================

function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.innerHTML = `
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Agregar estilos si no existen
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.innerHTML = `
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 50px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 15px;
                animation: slideInRight 0.3s ease;
                font-weight: 500;
            }
            
            .notification-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .notification-info {
                background: var(--color-primary);
                color: var(--color-dark);
            }
            
            .notification button {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                opacity: 0.7;
            }
            
            .notification button:hover {
                opacity: 1;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// =====================================
// EVENTOS GLOBALES
// =====================================

// Cerrar modal con tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        cerrarModalProducto();
    }
});

// Optimización de rendimiento para eventos de scroll
let ticking = false;

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateScrollEffects);
        ticking = true;
    }
}

function updateScrollEffects() {
    handleNavbarScroll();
    updateActiveNavLink();
    ticking = false;
}

// Reemplazar eventos de scroll individuales por uno optimizado
window.removeEventListener('scroll', handleNavbarScroll);
window.removeEventListener('scroll', updateActiveNavLink);
window.addEventListener('scroll', requestTick);

console.log('🥖 El Artesano - JavaScript cargado correctamente');