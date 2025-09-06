// ===== helpers =====
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

// ===== dark mode =====
function initDarkMode() {
    const body = document.body;
    const toggle = $('#darkModeToggle');
    function applyDark(isDark) {
        body.classList.toggle('dark', isDark);
        localStorage.setItem('darkMode', isDark ? '1' : '0');
        if (toggle) toggle.textContent = isDark ? '☀️' : '🌙';
    }
    applyDark(localStorage.getItem('darkMode') === '1');
    if (toggle) {
        toggle.addEventListener('click', () => applyDark(!body.classList.contains('dark')));
    }
    window.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === 'd') applyDark(!body.classList.contains('dark'));
    });
}

// ===== preloader =====
function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;
    window.addEventListener('load', () => {
        pre.classList.add('hide');
        // remove after transition if any, fallback 500ms
        setTimeout(() => pre.remove(), 500);
    });
}

// ===== scroll animations =====
function initScrollAnimations() {
    const items = $$('[data-animate]');
    if (!items.length) return;
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                en.target.classList.add('show');
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.18 });
    items.forEach(it => io.observe(it));
}

// ===== navbar: active link, shrink, drawer =====
function initNavbar() {
    // active link
    const path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-link').forEach(a => {
        if (a.getAttribute('href') === path) a.classList.add('active');
    });

    // shrink on scroll
    const navbar = $('.navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('shrink', window.scrollY > 10);
        window.addEventListener('scroll', onScroll);
        onScroll();
    }

    // drawer toggle (mobile)
    const drawer = $('.nav-drawer');
    const toggle = $('#drawerToggle');
    function closeDrawer() {
        if (!drawer) return;
        drawer.classList.remove('open');
        if (toggle) toggle.classList.remove('active');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        // restore scroll
        document.body.style.overflow = '';
    }
    if (toggle && drawer) {
        toggle.addEventListener('click', (e) => {
            drawer.classList.toggle('open');
            toggle.classList.toggle('active');
            const open = drawer.classList.contains('open');
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.body.style.overflow = open ? 'hidden' : '';
        });

        // click outside to close
        document.addEventListener('click', (e) => {
            if (!drawer.classList.contains('open')) return;
            const inside = drawer.contains(e.target) || toggle.contains(e.target);
            if (!inside) closeDrawer();
        });

        // escape to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDrawer();
        });
    }
}

// ===== back to top =====
function initBackToTop() {
    const btn = $('#backToTop');
    if (!btn) return;
    const onScroll = () => {
        if (window.scrollY > 300) btn.classList.add('show');
        else btn.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll);
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
}

// ===== cursor glow =====
function initCursorGlow() {
    const glow = $('#cursorGlow');
    if (!glow) return;
    let rafId = null;
    window.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            glow.style.left = `${e.clientX}px`;
            glow.style.top = `${e.clientY}px`;
            glow.style.opacity = '1';
        });
    });
    window.addEventListener('mouseout', () => glow.style.opacity = '0');
}

// ===== skills animation =====
function initSkillBars() {
    const container = $('.skills');
    if (!container) return;
    const bars = $$('.skill-bar div', container);
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(en => {
            if (en.isIntersecting) {
                bars.forEach(b => b.style.width = b.dataset.width || '0%');
                obs.unobserve(en.target);
            }
        });
    }, { threshold: 0.45 });
    io.observe(container);
}

// ===== projects: render, filter, modal =====
const PROJECTS = [
    { title: "Modern Dashboard", tech: ["react", "css"], desc: "Yönetim paneli, API entegrasyonu.", img: "https://source.unsplash.com/800x450/?dashboard,interface" },
    { title: "Kişisel Blog", tech: ["js", "css"], desc: "MDX tabanlı içerik, SEO uyumlu.", img: "https://source.unsplash.com/800x450/?blog,writing" },
    { title: "Mobil UI Kit", tech: ["react", "js"], tag: "React, JS", desc: "Reusable bileşenler.", img: "https://source.unsplash.com/800x450/?mobile,app" },
    { title: "Landing Page", tech: ["css"], desc: "Hafif ve hızlı açılan şablon.", img: "https://source.unsplash.com/800x450/?landing,web" }, { title: "Landing Page", tech: ["css"], desc: "Hafif ve hızlı açılan şablon.", img: "https://source.unsplash.com/800x450/?landing,web" },
    { title: "Landing Page", tech: ["css"], desc: "Hafif ve hızlı açılan şablon.", img: "https://source.unsplash.com/800x450/?landing,web" },
    { title: "Landing Page", tech: ["css"], desc: "Hafif ve hızlı açılan şablon.", img: "https://source.unsplash.com/800x450/?landing,web" },
    { title: "Landing Page", tech: ["css"], desc: "Hafif ve hızlı açılan şablon.", img: "https://source.unsplash.com/800x450/?landing,web" },
];

function renderProjects() {
    const grid = $('#projectGrid');
    if (!grid) return;
    grid.innerHTML = '';
    PROJECTS.forEach((p, idx) => {
        const art = document.createElement('article');
        art.className = 'project-card';
        art.setAttribute('data-animate', '');
        art.innerHTML = `
      <div class="project-card-inner">
        <img src="${p.img}" alt="${p.title} görseli">
        <div class="project-info">
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
          <div class="tech-icons">${(p.tag || p.tech.join(', '))}</div>
          <button class="open-detail" data-index="${idx}">Detay</button>
        </div>
      </div>`;
        grid.appendChild(art);
    });
}

function initProjectFilters() {
    const chips = $$('.chip');
    const grid = $('#projectGrid');
    if (!chips.length || !grid) return;
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const key = chip.dataset.filter;
            const cards = $$('.project-card', grid);
            cards.forEach((card, i) => {
                const show = key === 'all' ? true : PROJECTS[i].tech.includes(key);
                card.style.display = show ? '' : 'none';
            });
        });
    });
}

function initProjectModal() {
    const modal = $('#projectModal');
    if (!modal) return;
    const title = $('#modalTitle');
    const img = $('#modalImg');
    const desc = $('#modalDesc');
    const tech = $('#modalTech');
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-detail');
        if (!btn) return;
        const idx = Number(btn.dataset.index);
        const p = PROJECTS[idx];
        if (title) title.textContent = p.title;
        if (img) { img.src = p.img; img.alt = `${p.title} görseli`; }
        if (desc) desc.textContent = p.desc;
        if (tech) tech.textContent = p.tech.join(', ');
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    });
    const close = modal.querySelector('.close');
    if (close) close.addEventListener('click', () => {
        modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true');
    });
    window.addEventListener('click', e => { if (e.target === modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') modal.classList.remove('show'); });
}

// ===== contact form (demo) =====
function initContactForm() {
    const form = document.querySelector('#contactForm');
    const msg = document.querySelector('#formMessage');


};

document.addEventListener("DOMContentLoaded", () => {
    const typewriterEl = document.querySelector(".typewriter");
    if (!typewriterEl) return;

    const text = typewriterEl.textContent;
    typewriterEl.textContent = ""; // başta boş bırak

    let index = 0;

    function type() {
        if (index < text.length) {
            typewriterEl.textContent += text.charAt(index);
            index++;
            setTimeout(type, Math.random() * 120 + 50); // 50-170ms arası rastgele hız
        } else {
            // tamamlandıktan 2 saniye sonra tekrar başla
            setTimeout(() => {
                typewriterEl.textContent = "";
                index = 0;
                type();
            }, 2000);
        }
    }

    type();
});



// ===== init all =====
document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initDarkMode();
    initNavbar();
    initBackToTop();
    initCursorGlow();
    // Önce projeleri oluşturuyoruz.
    renderProjects();
    // Sonra projeler için animasyonları ve diğer işlevleri başlatıyoruz.
    initScrollAnimations();
    initSkillBars();
    initProjectFilters();
    initProjectModal();
    initContactForm();
});
