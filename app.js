const state = {
  content: null,
  appointments: [],
  slots: {},
  selectedDate: '',
  selectedTime: '',
  adminEmail: '',
  activeTab: 'content',
  dirty: false
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const paths = {
  get(object, path) {
    return path.split('.').reduce((value, key) => (value ? value[key] : undefined), object);
  },
  set(object, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((cursor, key) => {
      cursor[key] = cursor[key] || {};
      return cursor[key];
    }, object);
    target[last] = value;
  }
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Erreur reseau');
  }
  return data;
}

async function init() {
  bindNavigation();
  bindBooking();
  bindContact();
  bindAdmin();
  await loadPublic();
  state.selectedDate = todayIso();
  $('[data-booking-date]').value = state.selectedDate;
  $('[data-booking-date]').min = todayIso();
  await loadSlots();
}

function bindNavigation() {
  const header = $('[data-header]');
  const button = $('[data-menu-button]');
  const nav = $('[data-nav]');
  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  });
  button.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    button.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  $$('.main-nav a').forEach((link) => {
    link.addEventListener('click', () => nav.classList.remove('is-open'));
  });
}

async function loadPublic() {
  const data = await api('/api/public');
  state.content = data.content;
  renderPublic();
}

function renderPublic() {
  const content = state.content;
  renderLogo(content.logo);
  renderNav(content);
  renderHero(content.hero);
  renderPresentation(content.presentation);
  renderServices(content);
  renderGallery(content);
  renderVideo(content);
  renderReviews(content);
  renderBookingCopy(content);
  renderContact(content);
}

function renderNav(content) {
  $('[data-brand-subtitle]').textContent = content.brandSubtitle || 'Head Spa';
  $('[data-footer-subtitle]').textContent = content.brandSubtitle || 'Head Spa';
  $$('[data-nav-label]').forEach((node) => {
    const key = node.dataset.navLabel;
    node.textContent = content.nav?.[key] || node.textContent;
  });
}

function renderLogo(src) {
  const logo = $('[data-logo]');
  const fallback = $('[data-logo-fallback]');
  if (src) {
    logo.src = src;
    logo.hidden = false;
    fallback.hidden = true;
  } else {
    logo.removeAttribute('src');
    logo.hidden = true;
    fallback.hidden = false;
  }
}

function renderHero(hero) {
  $('[data-hero-kicker]').textContent = hero.kicker || '';
  $('[data-hero-title]').textContent = hero.title || 'Au fil de soi';
  $('[data-hero-subtitle]').textContent = hero.subtitle || '';
  $('[data-hero-cta]').textContent = hero.cta || 'Prendre rendez-vous';
  $('[data-hero-secondary]').textContent = hero.secondaryCta || 'Decouvrir';
  const media = $('[data-hero-media]');
  if (hero.mediaType === 'video' && hero.src) {
    media.innerHTML = `<video src="${hero.src}" autoplay muted loop playsinline></video>`;
  } else {
    media.innerHTML = `<img src="${hero.src || '/assets/hero-spa.png'}" alt="" aria-hidden="true">`;
  }
}

function renderPresentation(presentation) {
  $('[data-presentation-kicker]').textContent = presentation.kicker || '';
  $('[data-presentation-title]').textContent = presentation.title || '';
  $('[data-presentation-body]').innerHTML = String(presentation.body || '')
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');
  const image = $('[data-presentation-image]');
  image.src = presentation.image || '/assets/gallery-room.png';
  image.alt = presentation.imageAlt || '';
  $('[data-presentation-feature-label]').textContent = presentation.featureLabel || '';
  $('[data-presentation-feature-text]').textContent = presentation.featureText || '';
  $('[data-values]').innerHTML = (presentation.values || [])
    .map((value) => `
      <article class="value-item">
        <span>${escapeHtml(value.icon || value.title?.slice(0, 1) || '')}</span>
        <h3>${escapeHtml(value.title)}</h3>
        <div></div>
        <p>${escapeHtml(value.body)}</p>
      </article>
    `)
    .join('');
}

function renderServices(content) {
  const section = content.sections?.services || {};
  $('[data-services-kicker]').textContent = section.kicker || '';
  $('[data-services-title]').textContent = section.title || '';
  $('[data-services-intro]').textContent = section.intro || '';
  $('[data-services-note]').textContent = section.customNote || '';
  $('[data-services-cta]').textContent = section.customCta || 'Nous contacter';

  $('[data-service-select]').innerHTML = (content.services || [])
    .map((service) => `<option value="${escapeHtml(service.name)}">${escapeHtml(service.name)} - ${Number(service.duration)} min</option>`)
    .join('');

  $('[data-services-grid]').innerHTML = (content.services || [])
    .map((service, index) => `
      <article class="service-card">
        <span class="service-number">${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(service.name)}</h3>
        <div class="service-meta">
          <span>${Number(service.duration)} min</span>
          <i></i>
          <strong>${escapeHtml(service.price || '')}</strong>
        </div>
        <div class="service-line"></div>
        <p>${escapeHtml(service.description || '')}</p>
        <a href="#reservation">Reserver ce soin</a>
      </article>
    `)
    .join('');
}

function renderGallery(content) {
  const section = content.sections?.gallery || {};
  $('[data-gallery-kicker]').textContent = section.kicker || '';
  $('[data-gallery-title]').textContent = section.title || '';
  $('[data-gallery]').innerHTML = (content.gallery || [])
    .map((item) => `
      <figure class="gallery-item">
        <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy">
        <figcaption>${escapeHtml(item.alt)}</figcaption>
      </figure>
    `)
    .join('');
}

function renderVideo(content) {
  const section = content.sections?.video || content.video || {};
  $('[data-video-kicker]').textContent = section.kicker || '';
  $('[data-video-title]').textContent = section.title || content.video.title || '';
  $('[data-video-caption]').textContent = section.caption || content.video.caption || '';
  const frame = $('[data-video-frame]');
  const embed = externalVideoEmbed(content.video.link);
  if (content.video.src) {
    frame.innerHTML = `<video src="${content.video.src}" controls></video>`;
  } else if (embed) {
    frame.innerHTML = `<iframe src="${embed}" title="Video de presentation" allowfullscreen loading="lazy"></iframe>`;
  } else {
    frame.innerHTML = `<div class="empty-state">${escapeHtml(section.caption || 'Video a ajouter depuis le mode admin.')}</div>`;
  }
}

function externalVideoEmbed(link) {
  if (!link) return '';
  try {
    const url = new URL(link);
    if (url.hostname.includes('youtube.com')) {
      const id = url.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (url.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    }
    if (url.hostname.includes('vimeo.com')) {
      return `https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}`;
    }
  } catch (error) {
    return '';
  }
  return '';
}

function renderReviews(content) {
  const section = content.sections?.reviews || {};
  $('[data-reviews-kicker]').textContent = section.kicker || '';
  $('[data-reviews-title]').textContent = section.title || 'Avis';
  const target = $('[data-reviews]');
  const reviews = content.reviews || [];
  if (!reviews.length) {
    target.innerHTML = `<div class="empty-state">${escapeHtml(section.empty || 'Aucun avis publie pour le moment.')}</div>`;
    return;
  }
  target.innerHTML = reviews.map((review) => `
    <article class="review-card">
      <div class="stars">${'★'.repeat(review.note)}${'☆'.repeat(5 - review.note)}</div>
      <p>${escapeHtml(review.comment)}</p>
      <strong>${escapeHtml(review.name)}</strong>
    </article>
  `).join('');
}

function renderBookingCopy(content) {
  const section = content.sections?.booking || {};
  $('[data-booking-kicker]').textContent = section.kicker || '';
  $('[data-booking-title]').textContent = section.title || '';
  $('[data-booking-intro]').textContent = section.intro || '';
  $('[data-booking-date-label]').textContent = section.dateLabel || 'Date';
  $('[data-booking-submit]').textContent = section.submitLabel || 'Confirmer la demande';
}

function renderContact(content) {
  const section = content.sections?.contact || {};
  $('[data-contact-kicker]').textContent = section.kicker || '';
  $('[data-contact-title]').textContent = section.title || '';
  $('[data-contact-intro]').textContent = section.intro || '';
  $('[data-contact-form-title]').textContent = section.formTitle || 'Envoyez-nous un message';
  $('[data-contact-submit]').textContent = section.submitLabel || 'Envoyer';
  $('[data-contact-address]').textContent = content.contact.address;
  const phone = $('[data-contact-phone]');
  phone.textContent = `${section.callLabel || 'Appeler'} ${content.contact.phone || ''}`.trim();
  phone.href = `tel:${String(content.contact.phone || '').replace(/\s/g, '')}`;
  $('[data-map]').src = content.contact.mapEmbedUrl;
}

function bindBooking() {
  const dateInput = $('[data-booking-date]');
  dateInput.addEventListener('change', async () => {
    state.selectedDate = dateInput.value;
    state.selectedTime = '';
    await loadSlots();
  });

  $('[data-booking-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = $('[data-booking-status]');
    if (!state.selectedTime) {
      status.textContent = state.content.sections?.booking?.noSelectedSlot || 'Selectionnez un creneau.';
      return;
    }
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.date = state.selectedDate;
    payload.time = state.selectedTime;
    try {
      await api('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      status.textContent = state.content.sections?.booking?.success || 'Votre demande est enregistree.';
      form.reset();
      state.selectedTime = '';
      await loadSlots();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

async function loadSlots() {
  const data = await api(`/api/slots?from=${encodeURIComponent(state.selectedDate)}&days=1`);
  state.slots = data.slots;
  renderSlots();
}

function renderSlots() {
  const target = $('[data-slot-grid]');
  const selected = $('[data-selected-slot]');
  const slots = state.slots[state.selectedDate] || [];
  const noSelected = state.content.sections?.booking?.noSelectedSlot || 'Aucun creneau selectionne';
  if (!slots.length) {
    target.innerHTML = `<div class="empty-state">${escapeHtml(state.content.sections?.booking?.noSlot || 'Aucun creneau disponible ce jour.')}</div>`;
    selected.textContent = noSelected;
    return;
  }
  target.innerHTML = slots.map((slot) => {
    const disabled = slot.status !== 'available';
    const label = disabled ? `${slot.time} occupe` : slot.time;
    return `<button class="slot ${state.selectedTime === slot.time ? 'is-selected' : ''}" type="button" data-slot="${slot.time}" ${disabled ? 'disabled' : ''}>${label}</button>`;
  }).join('');
  $$('[data-slot]', target).forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedTime = button.dataset.slot;
      $('[data-booking-time]').value = state.selectedTime;
      selected.textContent = `${state.selectedDate} a ${state.selectedTime}`;
      renderSlots();
    });
  });
  selected.textContent = state.selectedTime ? `${state.selectedDate} a ${state.selectedTime}` : noSelected;
}

function bindContact() {
  $('[data-contact-form]').addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = $('[data-contact-status]');
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api('/api/contact', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      status.textContent = state.content.sections?.contact?.success || 'Message envoye.';
      event.currentTarget.reset();
    } catch (error) {
      status.textContent = error.message;
    }
  });
}

function bindAdmin() {
  $('[data-open-admin]').addEventListener('click', openAdmin);
  $$('[data-close-admin]').forEach((button) => button.addEventListener('click', closeAdmin));
  $('[data-login-form]').addEventListener('submit', loginAdmin);
  $('[data-logout]').addEventListener('click', logoutAdmin);
  $('[data-admin-tabs]').addEventListener('click', switchAdminTab);
  $('[data-global-save]').addEventListener('click', saveGlobalAdminChanges);
  $('[data-save-advanced]').addEventListener('click', saveAdvancedJson);
  $('[data-service-form]').addEventListener('submit', addService);
  $('[data-review-form]').addEventListener('submit', addReview);
  $('[data-appointment-form]').addEventListener('submit', saveAppointment);
  $('[data-block-form]').addEventListener('submit', addBlockedSlot);
  $('[data-security-form]').addEventListener('submit', updateSecurity);
  $('[data-admin-workspace]').addEventListener('input', handleAdminDraftChange);
  $('[data-admin-workspace]').addEventListener('change', handleAdminDraftChange);
  setupDrops();
}

async function openAdmin() {
  $('[data-admin-drawer]').classList.add('is-open');
  $('[data-admin-drawer]').setAttribute('aria-hidden', 'false');
  try {
    const me = await api('/api/admin/me');
    state.adminEmail = me.email;
    await loadAdminData();
  } catch (error) {
    showLogin();
  }
}

function closeAdmin() {
  if (state.dirty && !confirm('Des modifications ne sont pas sauvegardees. Fermer quand meme ?')) return;
  $('[data-admin-drawer]').classList.remove('is-open');
  $('[data-admin-drawer]').setAttribute('aria-hidden', 'true');
}

async function loginAdmin(event) {
  event.preventDefault();
  const status = $('[data-login-status]');
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    const data = await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    state.adminEmail = data.email;
    status.textContent = '';
    await loadAdminData();
  } catch (error) {
    status.textContent = error.message;
  }
}

async function logoutAdmin() {
  await api('/api/admin/logout', { method: 'POST', body: '{}' });
  showLogin();
}

function showLogin() {
  $('[data-login-form]').hidden = false;
  $('[data-admin-workspace]').hidden = true;
}

function showAdmin() {
  $('[data-login-form]').hidden = true;
  $('[data-admin-workspace]').hidden = false;
  $('[data-admin-email]').textContent = state.adminEmail;
  setDirty(false);
}

async function loadAdminData() {
  const data = await api('/api/admin/data');
  state.content = data.content;
  state.appointments = data.appointments;
  showAdmin();
  renderPublic();
  fillAdminEditors();
  renderAdminCollections();
  await renderStats();
  await loadSlots();
}

function fillAdminEditors() {
  $$('[data-edit]').forEach((input) => {
    const value = paths.get(state.content, input.dataset.edit);
    input.value = value ?? '';
  });
  $('[data-advanced-json]').value = JSON.stringify(state.content, null, 2);
  const securityEmail = $('[data-security-form] [name="email"]');
  securityEmail.value = state.adminEmail;
  renderDayPicker();
}

function handleAdminDraftChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest('[data-security-form]') || target.closest('[data-appointment-form]') || target.closest('[data-review-form]') || target.closest('[data-service-form]') || target.closest('[data-block-form]')) return;
  if (target.matches('[data-advanced-json]')) {
    setDirty(true, 'JSON modifie, sauvegarde requise.');
    return;
  }
  if (target.matches('[data-edit], [data-value-field], [data-service-field], [data-review-field], [data-gallery-alt]') || target.closest('[data-day-picker]')) {
    collectAdminEditors();
    renderPublic();
    setDirty(true);
  }
}

function setDirty(isDirty, message) {
  state.dirty = isDirty;
  const bar = $('[data-admin-save-bar]');
  if (!bar) return;
  bar.classList.toggle('is-dirty', isDirty);
  $('[data-save-state]').textContent = message || (isDirty ? 'Modifications non sauvegardees' : 'Tout est sauvegarde');
  $('[data-save-hint]').textContent = isDirty
    ? 'Cliquez sur Sauvegarder pour conserver ces changements apres rechargement.'
    : 'Les changements du contenu seront conserves apres sauvegarde.';
}

function collectAdminEditors() {
  $$('[data-edit]').forEach((input) => {
    const value = input.type === 'number' ? Number(input.value) : input.value;
    paths.set(state.content, input.dataset.edit, value);
  });
  state.content.availability.openDays = $$('[data-day-picker] input:checked').map((input) => Number(input.value));
  collectValueRows();
  collectServiceRows();
  collectReviewRows();
}

async function saveContentFromEditors() {
  const status = $('[data-admin-status]') || $('[data-save-state]');
  collectAdminEditors();
  try {
    const data = await api('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ content: state.content })
    });
    state.content = data.content;
    renderPublic();
    fillAdminEditors();
    renderAdminCollections();
    status.textContent = 'Modifications enregistrees.';
    setDirty(false);
    await loadSlots();
  } catch (error) {
    status.textContent = error.message;
    setDirty(true, error.message);
  }
}

async function saveGlobalAdminChanges() {
  if (state.activeTab === 'advanced') {
    await saveAdvancedJson();
    return;
  }
  await saveContentFromEditors();
}

async function saveAdvancedJson() {
  const status = $('[data-advanced-status]');
  try {
    const content = JSON.parse($('[data-advanced-json]').value);
    const data = await api('/api/admin/content', {
      method: 'PUT',
      body: JSON.stringify({ content })
    });
    state.content = data.content;
    renderPublic();
    fillAdminEditors();
    renderAdminCollections();
    status.textContent = 'Configuration complete enregistree.';
    setDirty(false);
  } catch (error) {
    status.textContent = error.message;
    setDirty(true, error.message);
  }
}

function switchAdminTab(event) {
  const button = event.target.closest('[data-tab]');
  if (!button) return;
  state.activeTab = button.dataset.tab;
  $$('[data-tab]').forEach((tab) => tab.classList.toggle('is-active', tab === button));
  $$('[data-tab-panel]').forEach((panel) => panel.classList.toggle('is-active', panel.dataset.tabPanel === state.activeTab));
  if (state.activeTab === 'stats') renderStats();
  if (state.activeTab === 'advanced') $('[data-advanced-json]').value = JSON.stringify(state.content, null, 2);
}

function setupDrops() {
  $$('[data-drop]').forEach((zone) => {
    ['dragenter', 'dragover'].forEach((name) => {
      zone.addEventListener(name, (event) => {
        event.preventDefault();
        zone.classList.add('is-over');
      });
    });
    ['dragleave', 'drop'].forEach((name) => {
      zone.addEventListener(name, () => zone.classList.remove('is-over'));
    });
    zone.addEventListener('drop', async (event) => {
      event.preventDefault();
      await handleDrop(zone.dataset.drop, Array.from(event.dataTransfer.files || []));
    });
    zone.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = zone.dataset.drop === 'video' ? 'video/*' : zone.dataset.drop === 'hero' ? 'image/*,video/*' : 'image/*';
      input.multiple = zone.dataset.drop === 'gallery';
      input.addEventListener('change', async () => handleDrop(zone.dataset.drop, Array.from(input.files || [])));
      input.click();
    });
  });
}

async function handleDrop(target, files) {
  if (!files.length) return;
  const dataUrls = await Promise.all(files.map(fileToDataUrl));
  if (target === 'logo') {
    state.content.logo = dataUrls[0];
  }
  if (target === 'hero') {
    state.content.hero.src = dataUrls[0];
    state.content.hero.mediaType = files[0].type.startsWith('video/') ? 'video' : 'image';
  }
  if (target === 'presentation') {
    state.content.presentation.image = dataUrls[0];
    state.content.presentation.imageAlt = files[0].name.replace(/\.[^.]+$/, '');
  }
  if (target === 'gallery') {
    const additions = dataUrls
      .filter((_, index) => files[index].type.startsWith('image/'))
      .map((src, index) => ({ id: cryptoId(), src, alt: files[index].name.replace(/\.[^.]+$/, '') }));
    state.content.gallery.push(...additions);
  }
  if (target === 'video') {
    state.content.video.src = dataUrls[0];
    state.content.video.link = '';
  }
  renderPublic();
  fillAdminEditors();
  renderAdminCollections();
  setDirty(true, 'Media ajoute, sauvegarde requise.');
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cryptoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function renderAdminCollections() {
  renderValuesAdmin();
  renderServicesAdmin();
  renderGalleryAdmin();
  renderReviewsAdmin();
  renderAppointmentsAdmin();
  renderBlockedSlots();
}

function renderValuesAdmin() {
  const values = state.content.presentation.values || [];
  $('[data-values-admin]').innerHTML = values.map((value) => `
    <div class="admin-row value-row" data-value-id="${value.id}">
      <input data-value-field="icon" value="${escapeHtml(value.icon || '')}" placeholder="Initiale" />
      <input data-value-field="title" value="${escapeHtml(value.title || '')}" placeholder="Titre" />
      <input data-value-field="body" value="${escapeHtml(value.body || '')}" placeholder="Description" />
      <button type="button" data-remove-value="${value.id}">Supprimer</button>
    </div>
  `).join('') + `
    <button class="secondary-action" type="button" data-add-value>Ajouter une valeur</button>
  `;
  $('[data-add-value]').addEventListener('click', () => {
    state.content.presentation.values.push({ id: cryptoId(), icon: '', title: 'Nouvelle valeur', body: '' });
    renderValuesAdmin();
    renderPublic();
    setDirty(true);
  });
  $$('[data-remove-value]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!confirm('Supprimer cette valeur ?')) return;
      state.content.presentation.values = state.content.presentation.values.filter((value) => value.id !== button.dataset.removeValue);
      renderValuesAdmin();
      renderPublic();
      setDirty(true);
    });
  });
}

function collectValueRows() {
  state.content.presentation.values = $$('.value-row').map((row) => ({
    id: row.dataset.valueId,
    icon: $('[data-value-field="icon"]', row).value,
    title: $('[data-value-field="title"]', row).value,
    body: $('[data-value-field="body"]', row).value
  }));
}

function renderServicesAdmin() {
  $('[data-service-admin]').innerHTML = (state.content.services || []).map((service) => `
    <div class="admin-row service-row" data-service-id="${service.id}">
      <input data-service-field="name" value="${escapeHtml(service.name || '')}" placeholder="Nom" />
      <input data-service-field="duration" type="number" min="15" max="240" step="15" value="${Number(service.duration || 60)}" />
      <input data-service-field="price" value="${escapeHtml(service.price || '')}" placeholder="Prix" />
      <input data-service-field="description" value="${escapeHtml(service.description || '')}" placeholder="Description" />
      <button type="button" data-remove-service="${service.id}">Supprimer</button>
    </div>
  `).join('');
  $$('[data-remove-service]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!confirm('Supprimer cette prestation ?')) return;
      state.content.services = state.content.services.filter((service) => service.id !== button.dataset.removeService);
      renderServices(state.content);
      renderServicesAdmin();
      setDirty(true);
    });
  });
}

function collectServiceRows() {
  state.content.services = $$('.service-row').map((row) => ({
    id: row.dataset.serviceId,
    name: $('[data-service-field="name"]', row).value,
    duration: Number($('[data-service-field="duration"]', row).value),
    price: $('[data-service-field="price"]', row).value,
    description: $('[data-service-field="description"]', row).value
  }));
}

function addService(event) {
  event.preventDefault();
  const form = event.currentTarget;
  collectServiceRows();
  const payload = Object.fromEntries(new FormData(form).entries());
  state.content.services.push({
    id: cryptoId(),
    name: payload.name,
    duration: Number(payload.duration),
    price: payload.price,
    description: payload.description
  });
  form.reset();
  form.elements.duration.value = 60;
  renderServices(state.content);
  renderServicesAdmin();
  setDirty(true);
}

function renderGalleryAdmin() {
  $('[data-gallery-admin]').innerHTML = (state.content.gallery || []).map((item) => `
    <div class="media-row" data-id="${item.id}">
      <img src="${item.src}" alt="">
      <input value="${escapeHtml(item.alt)}" data-gallery-alt="${item.id}">
      <button type="button" data-remove-gallery="${item.id}">Supprimer</button>
    </div>
  `).join('');
  $$('[data-gallery-alt]').forEach((input) => {
    input.addEventListener('input', () => {
      const item = state.content.gallery.find((entry) => entry.id === input.dataset.galleryAlt);
      if (item) item.alt = input.value;
    });
  });
  $$('[data-remove-gallery]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!confirm('Supprimer cette image ?')) return;
      state.content.gallery = state.content.gallery.filter((item) => item.id !== button.dataset.removeGallery);
      renderPublic();
      renderGalleryAdmin();
      setDirty(true);
    });
  });
}

function renderReviewsAdmin() {
  $('[data-review-admin]').innerHTML = (state.content.reviews || []).length
    ? state.content.reviews.map((review) => `
      <div class="admin-row review-row" data-review-id="${review.id}">
        <input data-review-field="name" value="${escapeHtml(review.name)}" placeholder="Nom" />
        <input data-review-field="note" type="number" min="1" max="5" value="${Number(review.note)}" />
        <input data-review-field="comment" value="${escapeHtml(review.comment)}" placeholder="Commentaire" />
        <button type="button" data-remove-review="${review.id}">Supprimer</button>
      </div>
    `).join('')
    : '<div class="empty-state">Aucun avis ajoute.</div>';
  $$('[data-remove-review]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!confirm('Supprimer cet avis ?')) return;
      state.content.reviews = state.content.reviews.filter((review) => review.id !== button.dataset.removeReview);
      renderPublic();
      renderReviewsAdmin();
      setDirty(true);
    });
  });
}

function collectReviewRows() {
  state.content.reviews = $$('.review-row').map((row) => ({
    id: row.dataset.reviewId,
    name: $('[data-review-field="name"]', row).value,
    note: Number($('[data-review-field="note"]', row).value),
    comment: $('[data-review-field="comment"]', row).value
  }));
}

function addReview(event) {
  event.preventDefault();
  collectReviewRows();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  state.content.reviews.push({
    id: cryptoId(),
    name: payload.name,
    note: Number(payload.note),
    comment: payload.comment
  });
  form.reset();
  form.elements.note.value = 5;
  renderPublic();
  renderReviewsAdmin();
  setDirty(true);
}

function renderAppointmentsAdmin() {
  const tbody = $('[data-appointments-admin]');
  tbody.innerHTML = state.appointments
    .slice()
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong><br><small>${escapeHtml(item.notes || '')}</small></td>
        <td>${escapeHtml(item.email || '')}<br>${escapeHtml(item.phone || '')}</td>
        <td>${escapeHtml(item.service || '')}</td>
        <td>${escapeHtml(item.date)}<br>${escapeHtml(item.time)}</td>
        <td>
          <div class="row-actions">
            <button type="button" data-edit-appointment="${item.id}">Modifier</button>
            <button type="button" data-delete-appointment="${item.id}">Supprimer</button>
          </div>
        </td>
      </tr>
    `).join('');
  $$('[data-edit-appointment]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = state.appointments.find((appointment) => appointment.id === button.dataset.editAppointment);
      const form = $('[data-appointment-form]');
      ['id', 'name', 'email', 'phone', 'service', 'date', 'time', 'notes'].forEach((key) => {
        form.elements[key].value = item[key] || '';
      });
    });
  });
  $$('[data-delete-appointment]').forEach((button) => {
    button.addEventListener('click', () => deleteAppointment(button.dataset.deleteAppointment));
  });
}

async function saveAppointment(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const id = payload.id;
  const endpoint = id ? `/api/admin/appointments/${encodeURIComponent(id)}` : '/api/admin/appointments';
  const method = id ? 'PUT' : 'POST';
  try {
    await api(endpoint, { method, body: JSON.stringify(payload) });
    form.reset();
    await loadAdminData();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteAppointment(id) {
  if (!confirm('Supprimer ce rendez-vous ?')) return;
  await api(`/api/admin/appointments/${encodeURIComponent(id)}`, { method: 'DELETE' });
  await loadAdminData();
}

function renderDayPicker() {
  const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  $('[data-day-picker]').innerHTML = labels.map((label, index) => `
    <label>
      <input type="checkbox" value="${index}" ${state.content.availability.openDays.includes(index) ? 'checked' : ''}>
      ${label}
    </label>
  `).join('');
}

function addBlockedSlot(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  state.content.availability.blockedSlots.push(payload);
  event.currentTarget.reset();
  renderBlockedSlots();
  setDirty(true);
}

function renderBlockedSlots() {
  const blocked = state.content.availability.blockedSlots || [];
  $('[data-blocked-admin]').innerHTML = blocked.length
    ? blocked.map((slot, index) => `
      <div class="admin-row">
        <strong>${escapeHtml(slot.date)} ${escapeHtml(slot.time)}</strong>
        <span>${escapeHtml(slot.reason || 'Bloque')}</span>
        <button type="button" data-remove-block="${index}">Retirer</button>
      </div>
    `).join('')
    : '<div class="empty-state">Aucun creneau bloque.</div>';
  $$('[data-remove-block]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!confirm('Retirer ce blocage ?')) return;
      state.content.availability.blockedSlots.splice(Number(button.dataset.removeBlock), 1);
      renderBlockedSlots();
      setDirty(true);
    });
  });
}

async function renderStats() {
  if ($('[data-admin-workspace]').hidden) return;
  const data = await api('/api/admin/stats');
  const stats = data.stats;
  $('[data-stats]').innerHTML = `
    <div class="stat-card"><span>Rendez-vous</span><strong>${stats.totalAppointments}</strong></div>
    <div class="stat-card"><span>Clients</span><strong>${stats.totalClients}</strong></div>
    <div class="stat-card"><span>Creneau favori</span><strong>${stats.popularSlots[0]?.time || '-'}</strong></div>
  `;
  const rows = stats.reservationsByMonth.length ? stats.reservationsByMonth : [{ month: 'Aucune donnee', count: 0 }];
  const max = Math.max(1, ...rows.map((row) => row.count));
  $('[data-chart]').innerHTML = rows.map((row) => `
    <div class="bar-row">
      <span>${escapeHtml(row.month)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(row.count / max) * 100}%"></div></div>
      <strong>${row.count}</strong>
    </div>
  `).join('') + `
    <div class="admin-list">
      ${(stats.popularSlots.length ? stats.popularSlots : [{ time: 'Aucun creneau', count: 0 }]).map((slot) => `
        <div class="admin-row">
          <strong>${escapeHtml(slot.time)}</strong>
          <span>Creneau utilise ${slot.count} fois</span>
          <span></span>
        </div>
      `).join('')}
    </div>
  `;
}

async function updateSecurity(event) {
  event.preventDefault();
  const status = $('[data-security-status]');
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  try {
    const data = await api('/api/admin/security', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    state.adminEmail = data.email;
    $('[data-admin-email]').textContent = data.email;
    status.textContent = 'Securite mise a jour.';
    event.currentTarget.elements.currentPassword.value = '';
    event.currentTarget.elements.nextPassword.value = '';
  } catch (error) {
    status.textContent = error.message;
  }
}

init().catch((error) => {
  document.body.innerHTML = `<main class="section"><h1>Erreur</h1><p>${escapeHtml(error.message)}</p></main>`;
});
