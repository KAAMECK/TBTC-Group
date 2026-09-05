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
let visitStorage;
try { visitStorage = window.sessionStorage; } catch (_) {}
const visitSource = window.TBTC_ATTRIBUTION?.resolve(window.location.href, document.referrer, visitStorage);
let sourceIsAutomatic = Boolean(visitSource);

function updateDepartment() {
  const key = form.elements.departement.value;
  const name = Object.hasOwn(serviceNames, key) ? serviceNames[key] : '';
  const context = document.querySelector('#request-context');
  context.textContent = name ? `Votre demande : TBTC ${name}` : '';
  context.hidden = !name;
  form.elements.message.placeholder = name ? `Décrivez votre besoin en ${name.toLocaleLowerCase('fr')} en quelques mots.` : 'Décrivez votre besoin en quelques mots.';
}

function toggleFields(id, show) {
  const section = document.getElementById(id);
  section.hidden = !show;
  section.querySelectorAll('input, select').forEach(input => {
    input.disabled = !show;
    input.required = show;
    if (!show) input.setCustomValidity('');
  });
}

function updateDiscovery() {
  const origin = form.elements.origine.value;
  toggleFields('social-fields', origin === 'social');
  toggleFields('source-detail-fields', ['search', 'website', 'other'].includes(origin) || (origin === 'social' && form.elements.reseau.value === 'Autre'));
  toggleFields('commission-fields', origin === 'commissionnaire');
  document.getElementById('discovery-note').textContent = sourceIsAutomatic
    ? 'Provenance préremplie à partir du lien reçu. Vous pouvez la corriger.'
    : 'Choisissez la source qui vous a fait découvrir le site.';
}

function prepareForm() {
  form.elements.departement.value = selectedService ? serviceKey : '';
  sourceIsAutomatic = Boolean(visitSource);
  if (visitSource) {
    form.elements.origine.value = visitSource.type;
    form.elements.reseau.value = visitSource.network;
    form.elements.source_detail.value = visitSource.detail;
  }
  updateDepartment();
  updateDiscovery();
}

if (form) {
  prepareForm();
  form.elements.departement.addEventListener('change', updateDepartment);
  ['origine', 'reseau', 'source_detail'].forEach(name => {
    form.elements[name].addEventListener('input', () => {
      sourceIsAutomatic = false;
      updateDiscovery();
    });
  });
  ['telephone', 'commissionnaire_telephone'].forEach(name => {
    const input = form.elements[name];
    input.addEventListener('input', () => {
      const digits = input.value.replace(/\D/g, '');
      const valid = /^[+\d\s().-]+$/.test(input.value) && digits.length >= 7 && digits.length <= 15;
      input.setCustomValidity(input.value && !valid ? 'Indiquez un numéro valide de 7 à 15 chiffres, avec l’indicatif si nécessaire.' : '');
    });
  });
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
  if (form.getAttribute('aria-busy') === 'true') return;
  form.querySelectorAll('input:not(:disabled), textarea:not(:disabled)').forEach(input => { input.value = input.value.trim(); });
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const departmentKey = String(data.get('departement') || '');
  if (!Object.hasOwn(serviceNames, departmentKey)) return;
  const sourceLabels = { commissionnaire: 'Commissionnaire', social: 'Réseau social / messagerie', search: 'Moteur de recherche', website: 'Autre site', direct: 'Adresse saisie ou favori', other: 'Autre source' };
  const origin = String(data.get('origine') || '');
  if (!Object.hasOwn(sourceLabels, origin)) return;
  const sourceParts = [sourceLabels[origin]];
  if (origin === 'social') sourceParts.push(String(data.get('reseau') || ''));
  if (data.get('source_detail')) sourceParts.push(String(data.get('source_detail')).trim());
  if (origin === 'commissionnaire') {
    sourceParts.push('Nom : ' + String(data.get('commissionnaire_nom') || '').trim());
    sourceParts.push('Téléphone : ' + String(data.get('commissionnaire_telephone') || '').trim());
  }
  sourceParts.push(sourceIsAutomatic ? 'Préremplie (' + visitSource.mode + ')' : 'Déclarée par le client');
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
    telephone: String(data.get('telephone') || '').trim(),
    email: '#',
    departement: serviceNames[departmentKey],
    objet: serviceSubjects[departmentKey],
    lieu: '#',
    budget: '#',
    delai: '#',
    // La colonne Source du registre existant conserve aussi le commissionnaire.
    source: sourceParts.join(' | '),
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
      prepareForm();
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
