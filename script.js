const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = nav.querySelectorAll('a');

const closeMenu = () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.classList.remove('menu-open');
};

toggle.addEventListener('click', () => {
  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  toggle.setAttribute('aria-label', isOpen ? 'Ouvrir le menu' : 'Fermer le menu');
  document.body.classList.toggle('menu-open', !isOpen);
});

navLinks.forEach((link) => link.addEventListener('click', closeMenu));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px' });

  revealItems.forEach((item) => observer.observe(item));
}

const form = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const apiUrl = window.TBTC_CONFIG?.apiUrl;
  const button = form.querySelector('button[type="submit"]');

  if (!apiUrl || apiUrl === '#') {
    formStatus.textContent = 'Le registre administratif est en cours de configuration. Veuillez rÃ©essayer prochainement.';
    return;
  }

  const payload = new URLSearchParams({
    nom: String(data.get('nom') || ''),
    telephone: String(data.get('telephone') || ''),
    email: String(data.get('email') || '#'),
    departement: String(data.get('departement') || ''),
    objet: String(data.get('objet') || ''),
    message: String(data.get('message') || ''),
    lieu: String(data.get('lieu') || '#'),
    budget: String(data.get('budget') || '#'),
    delai: String(data.get('delai') || '#'),
    source: 'Site web',
    priorite: 'Normale',
    website: String(data.get('website') || '')
  });

  button.disabled = true;
  button.textContent = 'Enregistrementâ€¦';
  formStatus.textContent = '';

  fetch(apiUrl, { method: 'POST', body: payload })
    .then((response) => response.json())
    .then((result) => {
      if (!result.ok) throw new Error(result.error || 'Enregistrement impossible');
      form.reset();
      formStatus.textContent = `Demande enregistrÃ©e avec succÃ¨s. RÃ©fÃ©rence : ${result.reference}`;
    })
    .catch(() => {
      formStatus.textContent = 'La demande nâ€™a pas pu Ãªtre enregistrÃ©e. VÃ©rifiez votre connexion puis rÃ©essayez.';
    })
    .finally(() => {
      button.disabled = false;
      button.textContent = 'Envoyer la demande';
    });
});
document.querySelector('#year').textContent = new Date().getFullYear();
