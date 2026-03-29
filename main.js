/* ============================================================
   NAVIGATION
   ============================================================ */

const nav       = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
const allNavLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

// Scrolled state
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}, { passive: true });

// Mobile toggle
navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);

  const [top, mid, bot] = navToggle.querySelectorAll('span');
  if (isOpen) {
    top.style.transform = 'translateY(6.5px) rotate(45deg)';
    mid.style.opacity   = '0';
    bot.style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    top.style.transform = '';
    mid.style.opacity   = '';
    bot.style.transform = '';
  }
});

// Close menu when a link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    const [top, mid, bot] = navToggle.querySelectorAll('span');
    top.style.transform = '';
    mid.style.opacity   = '';
    bot.style.transform = '';
  });
});

/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   ============================================================ */

const sections = Array.from(document.querySelectorAll('section[id]'));

function setActiveLink() {
  const offset = 120;
  const scrollY = window.scrollY;

  let current = '';
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - offset) {
      current = sec.id;
    }
  });

  allNavLinks.forEach(link => {
    const href = link.getAttribute('href').replace('#', '');
    link.classList.toggle('active', href === current);
  });
}

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

/* ============================================================
   SMOOTH SCROLL (offset for fixed nav)
   ============================================================ */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64);
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
   ============================================================ */

const animElements = document.querySelectorAll('[data-animate]');

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Stagger siblings within the same parent container
    const siblings = Array.from(
      entry.target.parentElement?.querySelectorAll('[data-animate]') ?? []
    );
    const idx = siblings.indexOf(entry.target);
    const delay = idx * 90; // 90ms stagger

    setTimeout(() => {
      entry.target.classList.add('visible');
    }, delay);

    io.unobserve(entry.target);
  });
}, {
  threshold: 0.08,
  rootMargin: '0px 0px -50px 0px',
});

animElements.forEach(el => io.observe(el));

/* ============================================================
   PROJECT CARD EXPAND / COLLAPSE
   ============================================================ */

document.querySelectorAll('.project-card').forEach(card => {
  const head    = card.querySelector('.project-card__head');
  const expand  = card.querySelector('.project-card__expand');

  function open() {
    card.classList.add('open');
    head.setAttribute('aria-expanded', 'true');
    // Allow max-height transition by reading scrollHeight after display
    expand.style.maxHeight = expand.scrollHeight + 'px';
    // After transition end, switch to 'none' so content can grow freely
    expand.addEventListener('transitionend', function handler(e) {
      if (e.propertyName !== 'max-height') return;
      if (card.classList.contains('open')) {
        expand.style.maxHeight = 'none';
      }
      expand.removeEventListener('transitionend', handler);
    });
  }

  function close() {
    // Capture current height before collapsing
    expand.style.maxHeight = expand.scrollHeight + 'px';
    // Force reflow so the browser registers the explicit height
    expand.offsetHeight; // eslint-disable-line no-unused-expressions
    expand.style.maxHeight = '0';

    card.classList.remove('open');
    head.setAttribute('aria-expanded', 'false');
  }

  head.addEventListener('click', () => {
    if (card.classList.contains('open')) {
      close();
    } else {
      open();
      // Scroll card into view if partially hidden above fold
      setTimeout(() => {
        const rect = card.getBoundingClientRect();
        if (rect.top < 80) {
          window.scrollTo({
            top: window.scrollY + rect.top - 80,
            behavior: 'smooth',
          });
        }
      }, 80);
    }
  });

  // Keyboard support
  head.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      head.click();
    }
  });
});
