// Navbar scroll effect
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
});

// Theme toggle (dark / light)
const themeToggle = document.getElementById('themeToggle');

function applyThemeIcon() {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector('i');
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    icon.classList.toggle('fa-sun', isDark);
    icon.classList.toggle('fa-moon', !isDark);
}

if (themeToggle) {
    applyThemeIcon();
    themeToggle.addEventListener('click', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const next = isLight ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('srisign-theme', next);
        applyThemeIcon();
    });
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = navToggle.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Founder side slide
const founderSlide = document.getElementById('founderSlide');
const founderToggle = document.getElementById('founderToggle');

setTimeout(() => {
    founderSlide.classList.add('open');
}, 1400);

setTimeout(() => {
    if (founderSlide.classList.contains('open')) {
        founderSlide.classList.remove('open');
        founderHideTimer();
    }
}, 8000);

let hideTimer;
function founderHideTimer() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => founderToggle.classList.add('wiggle'), 300);
    setTimeout(() => founderToggle.classList.remove('wiggle'), 1200);
}

founderToggle.addEventListener('click', () => {
    founderSlide.classList.toggle('open');
});

// Contact form handling
const contactForm = document.getElementById('contactForm');

// Google Apps Script Web App URL - REPLACE after deployment (see Code.gs)
const ENQUIRY_ENDPOINT = 'REPLACE_WITH_YOUR_WEB_APP_URL';

if (contactForm) {
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('[type="submit"]');
    const originalText = submitBtn.innerHTML;

    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        service: document.getElementById('service').value,
        message: document.getElementById('message').value
    };

    let successDiv = contactForm.querySelector('.success-message');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.style = 'color:#fff;background:#155724;';
        contactForm.appendChild(successDiv);
    }

    // If you haven't connected Google Sheets yet, still show confirmation
    if (ENQUIRY_ENDPOINT.startsWith('REPLACE')) {
        showResult('Thank you, ' + formData.name + '! Your enquiry is noted. Connect Google Sheets to auto-save it (see Code.gs).');
        contactForm.reset();
        return;
    }

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitBtn.disabled = true;

    try {
        const res = await fetch(ENQUIRY_ENDPOINT, {
            method: 'POST',
            redirect: 'follow',
            body: JSON.stringify(formData)
        });
        const result = await res.json();

        if (result.success) {
            showResult('Thank you, ' + formData.name + '! Your enquiry has been sent. We will contact you soon.');
            contactForm.reset();
        } else {
            showResult('Something went wrong. Please try again or call us directly.', true);
        }
    } catch (err) {
        showResult('Could not reach the server. Please try again or call us directly.', true);
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }

    function showResult(message, isError) {
        if (isError) {
            successDiv.style.background = '#c1121f';
        } else {
            successDiv.style.background = '#155724';
        }
        successDiv.textContent = message;
        successDiv.classList.add('show');
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 6000);
    }
});
}

// Animated counter for hero stats
function animateCounter(el, target, duration) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        let value = Math.floor(eased * target);

        if (target >= 1000) {
            el.textContent = value.toLocaleString('en-IN');
        } else {
            el.textContent = value;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target.toLocaleString('en-IN');
        }
    }

    requestAnimationFrame(update);
}

// Scroll animations + counters
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .feature-item, .process-step, .testimonial-card, .design-card, .machine-card, .sample-item, .product-item, .digital-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
});

// Counter observer
const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target, 1600);
            countObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => {
    countObserver.observe(el);
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// 3D tilt effect on interactive cards (desktop only)
if (window.matchMedia('(hover: hover)').matches) {
    const tiltElements = document.querySelectorAll('.tilt-card');

    tiltElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(1000px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
        });
    });
}