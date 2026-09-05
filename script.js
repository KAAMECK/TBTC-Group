const header = document.querySelector('.site-header');
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = nav ? nav.querySelectorAll('a') : [];

const closeMenu = () => {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Ouvrir le menu');
  document.body.classList.remove('menu-open');
};

toggle?.addEventListener('click', () => {
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
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
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
const receipt = document.querySelector('#submission-receipt');
const receiptReference = document.querySelector('#receipt-reference');
const receiptDate = document.querySelector('#receipt-date');
const receiptTime = document.querySelector('#receipt-time');
const serviceNames = { construction: 'Construction', formation: 'Formation', track: 'Track', business: 'Business', electronique: 'Électronique', elevage: 'Élevage' };
const serviceKey = new URLSearchParams(window.location.search).get('service');
const selectedService = Object.hasOwn(serviceNames, serviceKey) ? serviceNames[serviceKey] : '';
const serviceSubjects = { construction: 'Demande de devis', formation: 'Demande de formation', track: 'Équipement de flotte', business: 'Demande d’offre', electronique: 'Demande d’intervention', elevage: 'Demande de commande' };
if (form && selectedService) {
  const context = document.querySelector('#request-context');
  context.textContent = `Votre demande : TBTC ${selectedService}`;
  context.hidden = false;
  form.elements.message.placeholder = `Décrivez votre besoin en ${selectedService.toLocaleLowerCase('fr')} en quelques mots.`;
}

const kinshasaDate = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  dateStyle: 'long'
});

const kinshasaTime = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Africa/Kinshasa',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const apiUrl = window.TBTC_CONFIG?.apiUrl;
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.querySelector('.submit-button-label');

  if (!apiUrl || apiUrl === '#') {
    formStatus.textContent = 'Le registre administratif est en cours de configuration. Veuillez réessayer prochainement.';
    formStatus.classList.add('is-error');
    return;
  }

  const payload = new URLSearchParams({
    nom: String(data.get('nom') || ''),
    message: String(data.get('message') || ''),
    // Valeurs internes : elles préservent la compatibilité avec le registre existant
    // sans demander ces informations au visiteur.
    telephone: '#',
    email: '#',
    departement: selectedService || 'Demande générale',
    objet: selectedService ? serviceSubjects[serviceKey] : 'Demande de devis',
    lieu: '#',
    budget: '#',
    delai: '#',
    source: 'Site web',
    priorite: 'Normale',
    website: String(data.get('website') || '')
  });

  button.disabled = true;
  button.classList.add('is-loading');
  buttonLabel.textContent = 'Enregistrement en cours…';
  form.setAttribute('aria-busy', 'true');
  formStatus.textContent = '';
  formStatus.classList.remove('is-error');
  receipt.hidden = true;

  fetch(apiUrl, { method: 'POST', body: payload })
    .then((response) => response.json())
    .then((result) => {
      if (!result.ok) throw new Error(result.error || 'Enregistrement impossible');
      form.reset();
      const receivedAt = new Date(result.receivedAt || Date.now());
      receiptReference.textContent = result.reference || '#';
      receiptDate.textContent = kinshasaDate.format(receivedAt);
      receiptTime.textContent = kinshasaTime.format(receivedAt);
      receipt.hidden = false;
      receipt.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    })
    .catch(() => {
      formStatus.textContent = 'La demande n’a pas pu être enregistrée. Vérifiez votre connexion puis réessayez.';
      formStatus.classList.add('is-error');
    })
    .finally(() => {
      button.disabled = false;
      button.classList.remove('is-loading');
      buttonLabel.textContent = button.dataset.defaultLabel || 'Envoyer la demande';
      form.removeAttribute('aria-busy');
    });
});
document.querySelectorAll('.current-year').forEach((year) => {
  year.textContent = new Date().getFullYear();
});
