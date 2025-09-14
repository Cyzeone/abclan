document.addEventListener("DOMContentLoaded", function() {

    const hamburguer = document.querySelector('.hamburguer');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const contactForm = document.getElementById('contactForm');
    const budgetForm = document.getElementById('budgetForm');

    if (hamburguer && navMenu) {
        hamburguer.addEventListener('click', () => {
            hamburguer.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href.startsWith('#') && !isHomePage) {
            link.setAttribute('href', `index.html${href}`);
        }
    });

    navLinks.forEach(link => {
        const hrefPage = link.getAttribute('href').split('/').pop().toLowerCase();
        let currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';

        if (isHomePage && hrefPage === 'index.html') link.classList.add('active');
        else link.classList.toggle('active', hrefPage === currentPage);
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (!targetSection) return;
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
            hamburguer.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    document.querySelectorAll(".submenu-toggle").forEach(toggle => {
        toggle.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            this.closest(".has-submenu").classList.toggle("open");
        });
        toggle.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.click();
            }
        });
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    function validatePhone(phone) {
        return /^(\+55\s?)?(\(?\d{2}\)?\s?)?(\d{4,5}[-.\s]?\d{4})$/.test(phone.trim());
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
    function validateField(field) {
        const value = field.value.trim();
        if (field.required && !value) { showFieldError(field, 'Este campo é obrigatório.'); return false; }
        if (field.name === 'email' && !validateEmail(value)) { showFieldError(field, 'Por favor, insira um e-mail válido.'); return false; }
        if (field.name === 'telefone' && !validatePhone(value)) { showFieldError(field, 'Por favor, insira um telefone válido.'); return false; }
        clearFieldError(field);
        return true;
    }
    function validateForm(form) {
        let isValid = true;
        form.querySelectorAll('input, textarea, select').forEach(field => {
            if (!validateField(field)) isValid = false;
        });
        return isValid;
    }
    function addFormValidation(form) {
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => validateField(field));
            field.addEventListener('input', () => clearFieldError(field));
        });
    }

    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(n => n.remove());
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<div class="notification-content" style="display:flex; justify-content:space-between;"><span>${message}</span></div>`;
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px;
            background: ${type==='success'?'#48bb78':type==='error'?'#f56565':'#4299e1'};
            color:#fff; padding:15px 20px; border-radius:8px; z-index:10000;
            max-width:400px; box-shadow:0 5px 15px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    [contactForm, budgetForm].filter(f => f).forEach(form => {
        addFormValidation(form);
        form.addEventListener('submit', e => {
            e.preventDefault();
            if (!validateForm(form)) return;

            const successMessage = form.id === 'contactForm'
                ? 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
                : 'Solicitação de orçamento enviada com sucesso! Entraremos em contato em breve.';

            fetch('envia-formulario.php', { method:'POST', body: new FormData(form) })
                .then(r => r.text())
                .then(text => {
                    let data;
                    try { data = JSON.parse(text); } 
                    catch { data = { success: text.includes('success') }; }
                    if (data.success) { showNotification(successMessage,'success'); form.reset(); }
                    else showNotification(data.message||'Erro ao enviar o formulário.','error');
                })
                .catch(()=>showNotification('Erro de conexão. Tente novamente.','error'));
        });
    });

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('fade-in-up'));
    }, { threshold:0.1, rootMargin:'0px 0px -50px 0px' });
    document.querySelectorAll('.servico-card, .marca-item, .info-item').forEach(el=>observer.observe(el));

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) { entry.target.style.opacity='1'; entry.target.style.transform='translateY(0)'; }
            });
        }, { threshold:0.1 }).observe(section);
    });

    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero-background');
        if(hero) hero.style.transform = `translateY(${window.pageYOffset*0.5}px)`;
    });

    document.querySelectorAll('img[data-src]').forEach(img=>{
        new IntersectionObserver(entries=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){
                    entry.target.src = entry.target.dataset.src;
                    entry.target.removeAttribute('data-src');
                }
            });
        }).observe(img);
    });

    document.querySelectorAll('a[href], button, textarea, input, select').forEach(el=>{
        el.addEventListener('focus', ()=>el.style.outline='2px solid #ff6b35');
        el.addEventListener('blur', ()=>el.style.outline='none');
    });

    const heroSwiper = new Swiper(".hero-swiper", {
        loop:true, autoplay:{delay:8000,disableOnInteraction:false},
        pagination:{el:".swiper-pagination",clickable:true},
        navigation:{nextEl:".swiper-button-next",prevEl:".swiper-button-prev"},
        effect:"slide", speed:600, grabCursor:true
    });

    const marcasSwiper = new Swiper('.marcas-swiper',{
        slidesPerView:2, spaceBetween:30,
        navigation:{nextEl:'.marcas-next', prevEl:'.marcas-prev'},
        breakpoints:{640:{slidesPerView:3}, 768:{slidesPerView:4}, 1024:{slidesPerView:5}}
    });

    const setaEsquerda = document.querySelector('.marcas-prev');
    const setaDireita = document.querySelector('.marcas-next');
    function atualizarSetas() {
        if(setaEsquerda) setaEsquerda.classList.toggle('hidden', marcasSwiper.isBeginning);
        if(setaDireita) setaDireita.classList.toggle('hidden', marcasSwiper.isEnd);
    }
    marcasSwiper.on('slideChange', atualizarSetas);
    marcasSwiper.on('reachBeginning', atualizarSetas);
    marcasSwiper.on('reachEnd', atualizarSetas);
    window.addEventListener('load', atualizarSetas);

    document.querySelectorAll('.ler-mais').forEach(botao=>{
        botao.addEventListener('click', ()=>{
            const infoExtra = botao.previousElementSibling;
            if(infoExtra.style.display==="block"){ infoExtra.style.display="none"; botao.textContent="Ler mais"; }
            else{ infoExtra.style.display="block"; botao.textContent="Mostrar menos"; }
        });
    });
    
    const toggle = document.getElementById('whatsappToggle');
    const menu = document.getElementById('whatsappMenu');
    if(toggle && menu){
        toggle.addEventListener('click', ()=>{ menu.style.display = menu.style.display==='flex'?'none':'flex'; });
        document.addEventListener('click', e=>{
            if(!toggle.contains(e.target) && !menu.contains(e.target)) menu.style.display='none';
        });
    }

});
