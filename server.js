const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'site-data.json');
const AUTH_PATH = path.join(DATA_DIR, 'admin-auth.json');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 4173);
const MAX_BODY_BYTES = 30 * 1024 * 1024;
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon'
};

const sessions = new Map();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function writeJson(file, value) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function defaultData() {
  return {
    content: defaultContent(),
    appointments: []
  };
}

function defaultContent() {
  return {
    logo: '',
    brandSubtitle: 'Head Spa',
    nav: {
      presentation: 'A propos',
      services: 'Soins',
      gallery: 'Galerie',
      reviews: 'Avis',
      booking: 'Reservation',
      contact: 'Contact',
      book: 'Reserver',
      admin: 'Admin'
    },
    hero: {
      mediaType: 'image',
      src: '/assets/hero-spa.png',
      title: 'Au fil de soi',
      kicker: 'Head Spa Japonais',
      subtitle: 'Votre sanctuaire de bien-etre. Laissez-vous envelopper par nos soins japonais du cuir chevelu, concus pour vous reconnecter a vous-meme.',
      cta: 'Prendre rendez-vous',
      secondaryCta: 'Decouvrir'
    },
    presentation: {
      kicker: 'Notre histoire',
      title: "L'art du soin, au rythme de vous",
      body: "Bienvenue dans notre univers dedie a la serenite et au bien-etre profond. Chez Au fil de soi, nous vous proposons une experience unique inspiree des rituels japonais du head spa.\n\nChaque soin est pense comme un voyage interieur : detendre le corps, liberer l'esprit, et chouchouter votre cuir chevelu avec des gestes precis et des produits d'exception.\n\nNotre philosophie repose sur trois piliers fondamentaux : la detente, le soin et la reconnexion a soi.",
      image: '/assets/gallery-room.png',
      imageAlt: 'Soin head spa',
      featureLabel: 'Experience',
      featureText: 'Rituels japonais',
      values: [
        { id: uid(), icon: 'D', title: 'Detente', body: 'Un espace pense pour vous deconnecter du quotidien et retrouver un calme profond.' },
        { id: uid(), icon: 'S', title: 'Soin', body: "Des rituels precis et des produits d'exception pour sublimer votre cuir chevelu." },
        { id: uid(), icon: 'R', title: 'Reconnexion', body: 'Chaque seance est une invitation a revenir a vous-meme, en douceur et en conscience.' }
      ]
    },
    sections: {
      services: {
        kicker: 'Nos soins',
        title: "L'art du soin du cuir chevelu",
        intro: "Chaque soin est une ceremonie pensee pour votre bien-etre. Choisissez l'experience qui vous correspond.",
        customNote: 'Vous souhaitez un soin personnalise ?',
        customCta: 'Nous contacter'
      },
      gallery: {
        kicker: 'Galerie',
        title: 'Notre univers'
      },
      video: {
        kicker: 'En images',
        title: "Vivez l'experience",
        caption: 'Ajoutez votre video de presentation depuis le mode admin.'
      },
      reviews: {
        kicker: 'Retours clients',
        title: 'Avis',
        empty: 'Aucun avis publie pour le moment.'
      },
      booking: {
        kicker: 'Rendez-vous',
        title: 'Reservez votre soin',
        intro: 'Les creneaux deja reserves sont indiques comme occupes, sans afficher aucune information client.',
        dateLabel: 'Date',
        noSlot: 'Aucun creneau disponible ce jour.',
        noSelectedSlot: 'Aucun creneau selectionne',
        submitLabel: 'Confirmer la demande',
        success: 'Votre demande est enregistree.'
      },
      contact: {
        kicker: 'Nous joindre',
        title: 'Contactez-nous',
        intro: 'Notre equipe est a votre disposition pour repondre a toutes vos questions et vous aider a choisir le soin le plus adapte.',
        formTitle: 'Envoyez-nous un message',
        submitLabel: 'Envoyer',
        callLabel: 'Appeler maintenant',
        success: 'Message envoye.'
      }
    },
    gallery: [
      { id: uid(), src: '/assets/gallery-ritual.png', alt: 'Soin du cuir chevelu' },
      { id: uid(), src: '/assets/gallery-room.png', alt: 'Espace de detente' },
      { id: uid(), src: '/assets/gallery-care.png', alt: 'Rituel et produits de soin' }
    ],
    video: {
      src: '',
      link: '',
      title: "Vivez l'experience",
      caption: 'Ajoutez votre video de presentation depuis le mode admin.'
    },
    reviews: [],
    contact: {
      phone: '+33 6 00 00 00 00',
      email: 'contact@aufildesoi.fr',
      address: '12 Rue de la Serenite, 75001 Paris',
      mapEmbedUrl: 'https://www.google.com/maps?q=France&output=embed'
    },
    availability: {
      openDays: [1, 2, 3, 4, 5, 6],
      start: '09:00',
      end: '18:30',
      slotMinutes: 60,
      blockedSlots: []
    },
    services: [
      {
        id: uid(),
        name: 'Head Spa Signature',
        duration: 60,
        price: '85 EUR',
        description: 'Notre soin phare : massage cranien profond, soin du cuir chevelu et vapeur enveloppante.'
      },
      {
        id: uid(),
        name: 'Soin Relaxant Express',
        duration: 30,
        price: '45 EUR',
        description: 'Un moment de detente intense pour les journees chargees.'
      },
      {
        id: uid(),
        name: 'Rituel Serenite',
        duration: 90,
        price: '120 EUR',
        description: "L'experience ultime : massage, soin, modelage et respiration guidee."
      },
      {
        id: uid(),
        name: 'Soin Revitalisant',
        duration: 45,
        price: '65 EUR',
        description: 'Stimulation du cuir chevelu avec huiles et gestuelle inspirees des rituels japonais.'
      }
    ]
  };
}

function ensureData() {
  ensureDir(DATA_DIR);
  if (!fs.existsSync(DB_PATH)) {
    writeJson(DB_PATH, defaultData());
  }
  if (!fs.existsSync(AUTH_PATH)) {
    const email = process.env.ADMIN_EMAIL || 'admin@aufildesoi.fr';
    const password = process.env.ADMIN_PASSWORD || 'Admin2026!';
    const auth = createAuthRecord(email, password);
    writeJson(AUTH_PATH, auth);
    console.log('');
    console.log('Identifiants admin crees pour Au fil de soi');
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: ${password}`);
    console.log('Changez-les depuis le dashboard admin avant une mise en ligne.');
    console.log('');
  }
}

function uid() {
  return crypto.randomBytes(10).toString('hex');
}

function createAuthRecord(email, password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);
  return {
    email: normalizeEmail(email),
    salt,
    hash,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(String(password), salt, 210000, 64, 'sha512').toString('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function timingSafeEqual(a, b) {
  const first = Buffer.from(String(a), 'hex');
  const second = Buffer.from(String(b), 'hex');
  if (first.length !== second.length) return false;
  return crypto.timingSafeEqual(first, second);
}

function loadDb() {
  return readJson(DB_PATH, defaultData());
}

function saveDb(db) {
  writeJson(DB_PATH, db);
}

function loadAuth() {
  return readJson(AUTH_PATH, null);
}

function saveAuth(auth) {
  writeJson(AUTH_PATH, auth);
}

function send(res, status, body, headers = {}) {
  const isBuffer = Buffer.isBuffer(body);
  const payload = isBuffer ? body : Buffer.from(String(body || ''));
  res.writeHead(status, {
    'Content-Length': payload.length,
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  res.end(payload);
}

function json(res, status, data, headers = {}) {
  send(res, status, JSON.stringify(data), {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers
  });
}

function notFound(res) {
  json(res, 404, { error: 'Introuvable' });
}

function badRequest(res, message) {
  json(res, 400, { error: message });
}

function unauthorized(res) {
  json(res, 401, { error: 'Connexion admin requise' });
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        return index === -1
          ? [decodeURIComponent(part), '']
          : [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function createSession(email) {
  const token = crypto.randomBytes(32).toString('base64url');
  sessions.set(token, { email, expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

function getSession(req) {
  const token = parseCookies(req).afs_session;
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  return { token, ...session };
}

function clearExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt < now) sessions.delete(token);
  }
}

function cookieForSession(token) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `afs_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}`;
}

function cookieForLogout() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `afs_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`;
}

function requireAdmin(req, res) {
  const session = getSession(req);
  if (!session) {
    unauthorized(res);
    return null;
  }
  return session;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error('Payload trop volumineux'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('JSON invalide'));
      }
    });
    req.on('error', reject);
  });
}

function sanitizeText(value, max = 5000) {
  return String(value || '').trim().slice(0, max);
}

function sanitizeDataUrl(value, acceptedPrefixes) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (text.startsWith('/assets/') || text.startsWith('/images/')) return text;
  if (acceptedPrefixes.some((prefix) => text.startsWith(prefix))) return text;
  if (/^https?:\/\/[^\s]+$/i.test(text)) return text;
  return '';
}

function sanitizeContent(content) {
  const defaults = defaultContent();
  const source = content || {};
  const hero = source.hero || {};
  const presentation = source.presentation || {};
  const contact = source.contact || {};
  const availability = source.availability || {};
  const services = Array.isArray(source.services) ? source.services : [];
  const gallery = Array.isArray(source.gallery) ? source.gallery : [];
  const reviews = Array.isArray(source.reviews) ? source.reviews : [];
  const video = source.video || {};
  const nav = source.nav || {};
  const sections = source.sections || {};

  const section = (name) => ({
    ...Object.fromEntries(
      Object.entries(defaults.sections[name]).map(([key, value]) => [
        key,
        sanitizeText(sections[name]?.[key] ?? value, key === 'intro' ? 700 : 160)
      ])
    )
  });

  return {
    logo: sanitizeDataUrl(source.logo, ['data:image/']),
    brandSubtitle: sanitizeText(source.brandSubtitle, 60) || defaults.brandSubtitle,
    nav: {
      presentation: sanitizeText(nav.presentation, 40) || defaults.nav.presentation,
      services: sanitizeText(nav.services, 40) || defaults.nav.services,
      gallery: sanitizeText(nav.gallery, 40) || defaults.nav.gallery,
      reviews: sanitizeText(nav.reviews, 40) || defaults.nav.reviews,
      booking: sanitizeText(nav.booking, 40) || defaults.nav.booking,
      contact: sanitizeText(nav.contact, 40) || defaults.nav.contact,
      book: sanitizeText(nav.book, 40) || defaults.nav.book,
      admin: sanitizeText(nav.admin, 40) || defaults.nav.admin
    },
    hero: {
      mediaType: hero.mediaType === 'video' ? 'video' : 'image',
      src: sanitizeDataUrl(hero.src, ['data:image/', 'data:video/']) || defaults.hero.src,
      title: sanitizeText(hero.title, 120) || defaults.hero.title,
      kicker: sanitizeText(hero.kicker, 120) || defaults.hero.kicker,
      subtitle: sanitizeText(hero.subtitle, 520) || defaults.hero.subtitle,
      cta: sanitizeText(hero.cta, 60) || defaults.hero.cta,
      secondaryCta: sanitizeText(hero.secondaryCta, 60) || defaults.hero.secondaryCta
    },
    presentation: {
      kicker: sanitizeText(presentation.kicker, 120) || defaults.presentation.kicker,
      title: sanitizeText(presentation.title, 160) || defaults.presentation.title,
      body: sanitizeText(presentation.body, 2600) || defaults.presentation.body,
      image: sanitizeDataUrl(presentation.image, ['data:image/']) || defaults.presentation.image,
      imageAlt: sanitizeText(presentation.imageAlt, 160) || defaults.presentation.imageAlt,
      featureLabel: sanitizeText(presentation.featureLabel, 80) || defaults.presentation.featureLabel,
      featureText: sanitizeText(presentation.featureText, 80) || defaults.presentation.featureText,
      values: Array.isArray(presentation.values)
        ? presentation.values
            .map((item) => {
              if (typeof item === 'string') {
                return { id: uid(), icon: sanitizeText(item[0], 2), title: sanitizeText(item, 60), body: '' };
              }
              return {
                id: sanitizeText(item.id || uid(), 64),
                icon: sanitizeText(item.icon, 8),
                title: sanitizeText(item.title, 60),
                body: sanitizeText(item.body, 360)
              };
            })
            .filter((item) => item.title)
            .slice(0, 8)
        : defaults.presentation.values
    },
    sections: {
      services: section('services'),
      gallery: section('gallery'),
      video: section('video'),
      reviews: section('reviews'),
      booking: section('booking'),
      contact: section('contact')
    },
    gallery: gallery
      .map((item) => ({
        id: sanitizeText(item.id || uid(), 64),
        src: sanitizeDataUrl(item.src, ['data:image/']),
        alt: sanitizeText(item.alt, 160)
      }))
      .filter((item) => item.src)
      .slice(0, 18),
    video: {
      src: sanitizeDataUrl(video.src, ['data:video/']),
      link: /^https?:\/\/[^\s]+$/i.test(String(video.link || '').trim()) ? String(video.link).trim() : '',
      title: sanitizeText(video.title, 120) || defaults.video.title,
      caption: sanitizeText(video.caption, 220) || defaults.video.caption
    },
    reviews: reviews
      .map((item) => ({
        id: sanitizeText(item.id || uid(), 64),
        name: sanitizeText(item.name, 80),
        comment: sanitizeText(item.comment, 700),
        note: Math.min(5, Math.max(1, Number(item.note || 5)))
      }))
      .filter((item) => item.name && item.comment)
      .slice(0, 30),
    contact: {
      phone: sanitizeText(contact.phone, 40) || defaults.contact.phone,
      email: sanitizeText(contact.email, 120) || defaults.contact.email,
      address: sanitizeText(contact.address, 240) || defaults.contact.address,
      mapEmbedUrl: /^https:\/\/www\.google\.com\/maps\//i.test(String(contact.mapEmbedUrl || '').trim())
        ? String(contact.mapEmbedUrl).trim()
        : defaults.contact.mapEmbedUrl
    },
    availability: {
      openDays: Array.isArray(availability.openDays)
        ? availability.openDays.map(Number).filter((day) => day >= 0 && day <= 6)
        : defaults.availability.openDays,
      start: normalizeTime(availability.start) || defaults.availability.start,
      end: normalizeTime(availability.end) || defaults.availability.end,
      slotMinutes: [30, 45, 60, 75, 90, 120].includes(Number(availability.slotMinutes))
        ? Number(availability.slotMinutes)
        : defaults.availability.slotMinutes,
      blockedSlots: Array.isArray(availability.blockedSlots)
        ? availability.blockedSlots
            .map((slot) => ({
              date: normalizeDate(slot.date),
              time: normalizeTime(slot.time),
              reason: sanitizeText(slot.reason, 120)
            }))
            .filter((slot) => slot.date && slot.time)
            .slice(0, 300)
        : []
    },
    services: services
      .map((item) => ({
        id: sanitizeText(item.id || uid(), 64),
        name: sanitizeText(item.name, 100),
        duration: Math.min(240, Math.max(15, Number(item.duration || 60))),
        price: sanitizeText(item.price, 40),
        description: sanitizeText(item.description, 500)
      }))
      .filter((item) => item.name)
      .slice(0, 12)
  };
}

function publicContent(content) {
  const cleaned = sanitizeContent(content);
  return {
    ...cleaned,
    availability: {
      openDays: cleaned.availability.openDays,
      start: cleaned.availability.start,
      end: cleaned.availability.end,
      slotMinutes: cleaned.availability.slotMinutes
    }
  };
}

function normalizeDate(value) {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : '';
}

function normalizeTime(value) {
  const text = String(value || '').trim();
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : '';
}

function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

function minutesToTime(total) {
  const hour = String(Math.floor(total / 60)).padStart(2, '0');
  const minute = String(total % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function isoDate(date) {
  return date.toISOString().slice(0, 10);
}

function listSlotsForDate(db, date) {
  const availability = sanitizeContent(db.content).availability;
  const day = new Date(`${date}T12:00:00`).getDay();
  const start = timeToMinutes(availability.start);
  const end = timeToMinutes(availability.end);
  const step = availability.slotMinutes;
  const isOpenDay = availability.openDays.includes(day);
  const appointments = db.appointments.filter((item) => item.date === date);
  const blocked = availability.blockedSlots.filter((item) => item.date === date);
  const slots = [];

  for (let minute = start; minute + step <= end; minute += step) {
    const time = minutesToTime(minute);
    const appointment = appointments.find((item) => item.time === time);
    const block = blocked.find((item) => item.time === time);
    let status = 'available';
    if (!isOpenDay) status = 'closed';
    if (block) status = 'blocked';
    if (appointment) status = 'occupied';
    slots.push({ time, status });
  }

  return slots;
}

function publicSlotPayload(db, from, days = 21) {
  const start = normalizeDate(from) ? new Date(`${from}T12:00:00`) : new Date();
  const count = Math.min(60, Math.max(1, Number(days || 21)));
  const result = {};
  for (let index = 0; index < count; index += 1) {
    const date = isoDate(addDays(start, index));
    result[date] = listSlotsForDate(db, date).map((slot) => ({
      time: slot.time,
      status: slot.status === 'occupied' || slot.status === 'blocked' ? 'occupied' : slot.status
    }));
  }
  return result;
}

function isSlotBookable(db, date, time) {
  const slot = listSlotsForDate(db, date).find((item) => item.time === time);
  return Boolean(slot && slot.status === 'available');
}

function sanitizeAppointment(input) {
  return {
    id: sanitizeText(input.id || uid(), 64),
    name: sanitizeText(input.name, 100),
    email: sanitizeText(input.email, 140),
    phone: sanitizeText(input.phone, 50),
    service: sanitizeText(input.service, 100),
    date: normalizeDate(input.date),
    time: normalizeTime(input.time),
    notes: sanitizeText(input.notes, 700),
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function statsFor(db) {
  const appointments = db.appointments;
  const clients = new Set(appointments.map((item) => normalizeEmail(item.email) || item.phone || item.name).filter(Boolean));
  const bySlot = {};
  const byMonth = {};
  const byService = {};
  appointments.forEach((item) => {
    bySlot[item.time] = (bySlot[item.time] || 0) + 1;
    byMonth[item.date.slice(0, 7)] = (byMonth[item.date.slice(0, 7)] || 0) + 1;
    byService[item.service || 'Non precise'] = (byService[item.service || 'Non precise'] || 0) + 1;
  });
  return {
    totalAppointments: appointments.length,
    totalClients: clients.size,
    popularSlots: Object.entries(bySlot)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count || a.time.localeCompare(b.time))
      .slice(0, 5),
    reservationsByMonth: Object.entries(byMonth)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    services: Object.entries(byService)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
  };
}

function serveStatic(req, res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const decoded = decodeURIComponent(requested);
  const filePath = path.normalize(path.join(PUBLIC_DIR, decoded));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    notFound(res);
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      notFound(res);
      return;
    }
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    const hotReloadType = type.startsWith('text/html') || type.startsWith('text/css') || type.startsWith('application/javascript');
    send(res, 200, data, {
      'Content-Type': type,
      'Cache-Control': hotReloadType ? 'no-store' : 'public, max-age=3600'
    });
  });
}

async function handleApi(req, res, url) {
  const db = loadDb();
  const pathname = url.pathname;

  if (req.method === 'GET' && pathname === '/api/public') {
    json(res, 200, { content: publicContent(db.content) });
    return;
  }

  if (req.method === 'GET' && pathname === '/api/slots') {
    json(res, 200, {
      slots: publicSlotPayload(db, url.searchParams.get('from'), url.searchParams.get('days'))
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/appointments') {
    const body = await readBody(req);
    const appointment = sanitizeAppointment(body);
    if (!appointment.name || !appointment.date || !appointment.time || (!appointment.phone && !appointment.email)) {
      badRequest(res, 'Nom, contact, date et horaire sont requis.');
      return;
    }
    if (!isSlotBookable(db, appointment.date, appointment.time)) {
      badRequest(res, 'Ce creneau est deja occupe ou indisponible.');
      return;
    }
    db.appointments.push(appointment);
    saveDb(db);
    json(res, 201, {
      appointment: {
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        service: appointment.service
      }
    });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/contact') {
    const body = await readBody(req);
    const message = {
      id: uid(),
      name: sanitizeText(body.name, 100),
      email: sanitizeText(body.email, 140),
      message: sanitizeText(body.message, 1200),
      createdAt: new Date().toISOString()
    };
    if (!message.name || !message.email || !message.message) {
      badRequest(res, 'Nom, email et message sont requis.');
      return;
    }
    const messagesPath = path.join(DATA_DIR, 'messages.json');
    const messages = readJson(messagesPath, []);
    messages.push(message);
    writeJson(messagesPath, messages);
    json(res, 201, { ok: true });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const body = await readBody(req);
    const auth = loadAuth();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    if (!auth || email !== auth.email || !timingSafeEqual(hashPassword(password, auth.salt), auth.hash)) {
      json(res, 403, { error: 'Identifiants incorrects' });
      return;
    }
    const token = createSession(auth.email);
    json(res, 200, { ok: true, email: auth.email }, { 'Set-Cookie': cookieForSession(token) });
    return;
  }

  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    const session = getSession(req);
    if (session) sessions.delete(session.token);
    json(res, 200, { ok: true }, { 'Set-Cookie': cookieForLogout() });
    return;
  }

  if (pathname.startsWith('/api/admin/')) {
    const session = requireAdmin(req, res);
    if (!session) return;

    if (req.method === 'GET' && pathname === '/api/admin/me') {
      json(res, 200, { email: session.email });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/data') {
      json(res, 200, { content: sanitizeContent(db.content), appointments: db.appointments });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/admin/content') {
      const body = await readBody(req);
      db.content = sanitizeContent(body.content);
      saveDb(db);
      json(res, 200, { content: sanitizeContent(db.content) });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/appointments') {
      json(res, 200, { appointments: db.appointments });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/appointments') {
      const body = await readBody(req);
      const appointment = sanitizeAppointment(body);
      if (!appointment.name || !appointment.date || !appointment.time) {
        badRequest(res, 'Nom, date et horaire sont requis.');
        return;
      }
      const existing = db.appointments.find((item) => item.date === appointment.date && item.time === appointment.time);
      if (existing) {
        badRequest(res, 'Un rendez-vous existe deja sur ce creneau.');
        return;
      }
      db.appointments.push(appointment);
      saveDb(db);
      json(res, 201, { appointment });
      return;
    }

    const appointmentMatch = pathname.match(/^\/api\/admin\/appointments\/([a-zA-Z0-9_-]+)$/);
    if (appointmentMatch && req.method === 'PUT') {
      const body = await readBody(req);
      const index = db.appointments.findIndex((item) => item.id === appointmentMatch[1]);
      if (index === -1) {
        notFound(res);
        return;
      }
      const appointment = sanitizeAppointment({ ...body, id: appointmentMatch[1], createdAt: db.appointments[index].createdAt });
      const conflict = db.appointments.find(
        (item) => item.id !== appointment.id && item.date === appointment.date && item.time === appointment.time
      );
      if (conflict) {
        badRequest(res, 'Un autre rendez-vous utilise deja ce creneau.');
        return;
      }
      db.appointments[index] = appointment;
      saveDb(db);
      json(res, 200, { appointment });
      return;
    }

    if (appointmentMatch && req.method === 'DELETE') {
      const before = db.appointments.length;
      db.appointments = db.appointments.filter((item) => item.id !== appointmentMatch[1]);
      if (before === db.appointments.length) {
        notFound(res);
        return;
      }
      saveDb(db);
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/stats') {
      json(res, 200, { stats: statsFor(db) });
      return;
    }

    if (req.method === 'PUT' && pathname === '/api/admin/security') {
      const body = await readBody(req);
      const auth = loadAuth();
      const nextEmail = normalizeEmail(body.email || auth.email);
      const currentPassword = String(body.currentPassword || '');
      const nextPassword = String(body.nextPassword || '');
      if (!auth || !timingSafeEqual(hashPassword(currentPassword, auth.salt), auth.hash)) {
        json(res, 403, { error: 'Mot de passe actuel incorrect' });
        return;
      }
      if (!nextEmail.includes('@')) {
        badRequest(res, 'Adresse email invalide.');
        return;
      }
      const nextAuth = nextPassword.length >= 10 ? createAuthRecord(nextEmail, nextPassword) : { ...auth, email: nextEmail };
      nextAuth.updatedAt = new Date().toISOString();
      saveAuth(nextAuth);
      json(res, 200, { email: nextAuth.email });
      return;
    }
  }

  notFound(res);
}

function requestHandler(req, res) {
  clearExpiredSessions();
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch((error) => {
      if (!res.headersSent) {
        const message = error.message || 'Erreur serveur';
        json(res, message.includes('volumineux') || message.includes('JSON') ? 400 : 500, { error: message });
      }
    });
    return;
  }
  serveStatic(req, res, url.pathname);
}

ensureData();

const server = http.createServer(requestHandler);
server.listen(PORT, HOST, () => {
  console.log(`Au fil de soi est pret: http://${HOST}:${PORT}`);
});
