// DOM Elements
const hamburguer = document.querySelector('.hamburguer');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const budgetForm = document.getElementById('budgetForm');

// Detecta se estamos na index
const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

// Ajusta links internos caso não esteja na index
navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#') && !isHomePage) {
        link.setAttribute('href', `index.html${href}`);
    }
});

// FIXA o active no Home na index.html
if (isHomePage) {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === 'index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
} else {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const hrefPage = href.split('/').pop().toLowerCase();
        let currentPage = window.location.pathname.split('/').pop().toLowerCase();
        if (!currentPage) currentPage = 'index.html';
        if (hrefPage === currentPage) {
            link.classList.add('active');
        }
    });
}

// Smooth Scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (!targetSection) return;

            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }

        hamburguer.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// AJAX Forms
function sendFormAJAX(form, successMessage) {
    const formData = new FormData(form);
    fetch('envia-formulario.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(successMessage, 'success');
            form.reset();
        } else {
            showNotification(data.message || 'Erro ao enviar o formulário.', 'error');
        }
    })
    .catch(() => showNotification('Erro de conexão. Tente novamente.', 'error'));
}

// Validação de formulário
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\(\)\s\-\+\d]{10,}$/.test(phone);
}

// Retorna true se válido, false se erro
function validateField(field) {
    const value = field.value.trim();

    if (field.required && !value) {
        showFieldError(field, 'Este campo é obrigatório.');
        return false;
    }

    if (field.name === 'email' && !validateEmail(value)) {
        showFieldError(field, 'Por favor, insira um e-mail válido.');
        return false;
    }

    if (field.name === 'telefone' && !validatePhone(value)) {
        showFieldError(field, 'Por favor, insira um telefone válido.');
        return false;
    }

    clearFieldError(field);
    return true;
}

function showFieldError(field, msg) {
    clearFieldError(field);
    field.style.borderColor = '#f56565';
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = msg;
    error.style.cssText = 'color:#f56565;font-size:14px;margin-top:5px;';
    field.parentNode.appendChild(error);
}

function clearFieldError(field) {
    field.style.borderColor = '#e2e8f0';
    field.parentNode.querySelector('.field-error')?.remove();
}

// Adiciona validação em tempo real e ao sair do campo
function addFormValidation(form) {
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
}

// Valida todo o formulário antes de enviar, retorna true/false
function validateForm(form) {
    let isValid = true;

    form.querySelectorAll('input, select, textarea').forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    return isValid;
}

if (contactForm) {
    addFormValidation(contactForm);

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(contactForm)) {
            sendFormAJAX(contactForm, 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
        }
    });
}

if (budgetForm) {
    addFormValidation(budgetForm);

    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(budgetForm)) {
            sendFormAJAX(budgetForm, 'Solicitação de orçamento enviada com sucesso! Entraremos em contato em breve.');
        }
    });
}

// Notificação visual
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    notification.innerHTML = `
        <div class="notification-content" style="display: flex; align-items: center; justify-content: space-between;">
            <span>${message}</span>
        </div>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    // A notificação desaparecerá automaticamente após 5 segundos
    setTimeout(() => notification.remove(), 5000);
}

// Form Validation
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validatePhone(phone) {
    const regex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-.\s]?\d{4})$/;
    return regex.test(phone.trim());
}
function validateField(field) {
    const value = field.value.trim();
    if (field.required && !value) return showFieldError(field, 'Este campo é obrigatório.');
    if (field.name === 'email' && !validateEmail(value)) return showFieldError(field, 'Por favor, insira um e-mail válido.');
    if (field.name === 'telefone' && !validatePhone(value)) return showFieldError(field, 'Por favor, insira um telefone válido.');
    clearFieldError(field);
}
function showFieldError(field, msg) {
    clearFieldError(field);
    field.style.borderColor = '#f56565';
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = msg;
    error.style.cssText = 'color:#f56565;font-size:14px;margin-top:5px;';
    field.parentNode.appendChild(error);
}
function clearFieldError(field) {
    field.style.borderColor = '#e2e8f0';
    field.parentNode.querySelector('.field-error')?.remove();
}
function addFormValidation(form) {
    form.querySelectorAll('input, select, textarea').forEach(field => {
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
}
if (contactForm) addFormValidation(contactForm);
if (budgetForm) addFormValidation(budgetForm);

// Intersection animations
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('fade-in-up'));
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.servico-card, .marca-item, .info-item').forEach(el => observer.observe(el));

// Parallax
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-background');
    if (hero) hero.style.transform = `translateY(${window.pageYOffset * 0.5}px)`;
});

// Lazy loading
const lazyImages = document.querySelectorAll('img[data-src]');
const lazyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            lazyObserver.unobserve(img);
        }
    });
});
lazyImages.forEach(img => lazyObserver.observe(img));

// Reveal sections
const revealSections = () => {
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 }).observe(section);
    });
};
document.addEventListener('DOMContentLoaded', revealSections);

// Accessibility focus
function manageFocus() {
    document.querySelectorAll('a[href], button, textarea, input, select').forEach(el => {
        el.addEventListener('focus', () => el.style.outline = '2px solid #ff6b35');
        el.addEventListener('blur', () => el.style.outline = 'none');
    });
}
manageFocus();

// ESC fecha menu mobile
window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburguer.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Swiper slider
new Swiper(".hero-swiper", {
    navigation: {
        nextEl: ".hero-next",
        prevEl: ".hero-prev",
    },
    loop: true,
    autoplay: { delay: 8000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    effect: "slide",
    speed: 600,
    grabCursor: true
});

const marcasSwiper = new Swiper('.marcas-swiper', {
    slidesPerView: 2,
    spaceBetween: 30,
    navigation: {
        nextEl: '.marcas-next',
        prevEl: '.marcas-prev',
    },
    breakpoints: {
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
    }
});

const setaEsquerda = document.querySelector('.marcas-prev');
const setaDireita = document.querySelector('.marcas-next');

function atualizarSetas() {
    if (setaEsquerda && marcasSwiper.isBeginning) {
        setaEsquerda.classList.add('hidden');
    } else if (setaEsquerda) {
        setaEsquerda.classList.remove('hidden');
    }

    if (setaDireita && marcasSwiper.isEnd) {
        setaDireita.classList.add('hidden');
    } else if (setaDireita) {
        setaDireita.classList.remove('hidden');
    }
}
marcasSwiper.on('slideChange', atualizarSetas);
marcasSwiper.on('reachBeginning', atualizarSetas);
marcasSwiper.on('reachEnd', atualizarSetas);
window.addEventListener('load', atualizarSetas);

// "Ler mais"
document.querySelectorAll('.ler-mais').forEach(botao => {
    botao.addEventListener('click', () => {
        const infoExtra = botao.previousElementSibling;
        if (infoExtra.style.display === "block") {
            infoExtra.style.display = "none";
            botao.textContent = "Ler mais";
        } else {
            infoExtra.style.display = "block";
            botao.textContent = "Mostrar menos";
        }
    });
});

// Hamburguer: abre/fecha menu
  const toggle = document.getElementById('whatsappToggle');
  const menu = document.getElementById('whatsappMenu');

  toggle.addEventListener('click', () => {
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

// Abre/fecha o menu mobile ao clicar no hamburguer
if (hamburguer && navMenu) {
    hamburguer.addEventListener('click', () => {
        hamburguer.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}
