// ---- Config ----
const WEDDING_DATE = new Date('2026-12-12T17:00:00');

// ---- Loader ----
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 700);
});

// ---- Navbar scroll state + mobile toggle ----
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ---- Scroll reveal ----
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- Countdown ----
function updateCountdown() {
  const now = new Date();
  const diff = WEDDING_DATE - now;
  if (diff <= 0) {
    document.getElementById('countdown').innerHTML = '<p>¡Ya nos casamos!</p>';
    return;
  }
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('cd-days').textContent = String(d).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(h).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(m).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(s).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---- Confetti celebration (fires once when Itinerario first appears) ----
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas.getContext('2d');
const confettiColors = ['#1F6F78', '#1A2E4A', '#8E3B46', '#C0964B', '#F5EEE0'];

function resizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener('resize', resizeConfettiCanvas);

function fireConfetti() {
  const particles = Array.from({ length: 150 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.3,
    size: 6 + Math.random() * 6,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    speedY: 2 + Math.random() * 3,
    speedX: (Math.random() - 0.5) * 2,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 10,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
  }));

  let frame = 0;
  const maxFrames = 220;

  function animate() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'circle') {
        confettiCtx.beginPath();
        confettiCtx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        confettiCtx.fill();
      } else {
        confettiCtx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      confettiCtx.restore();
    });
    frame++;
    if (frame < maxFrames) {
      requestAnimationFrame(animate);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  animate();
}

const confettiObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      fireConfetti();
      confettiObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });
confettiObserver.observe(document.getElementById('itinerario'));

// ---- Background music toggle ----
const musicToggle = document.getElementById('musicToggle');
const bgAudio = document.getElementById('bgAudio');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
let playing = false;

musicToggle.addEventListener('click', () => {
  if (playing) {
    bgAudio.pause();
  } else {
    bgAudio.play().catch(() => {});
  }
  playing = !playing;
  iconPlay.style.display = playing ? 'none' : 'block';
  iconPause.style.display = playing ? 'block' : 'none';
});

// ---- Gallery carousel lightbox ----
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.carousel-track img').forEach(img => {
  img.addEventListener('click', () => {
    lightboxContent.innerHTML = `<img src="${img.src}" alt="">`;
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

// ---- Modal close (shared by song-suggestion modal) ----
document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById(btn.dataset.close).classList.remove('open');
  });
});

// ---- Playlist tabs ----
document.querySelectorAll('.tab-btn').forEach(tabBtn => {
  tabBtn.addEventListener('click', () => {
    const container = tabBtn.closest('.fb-text');
    container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tabBtn.classList.add('active');
    document.getElementById(tabBtn.dataset.tab).classList.add('active');
  });
});

// ---- Song suggestions (stored locally) ----
const songForm = document.getElementById('songForm');
const songCountEl = document.getElementById('songCount');
const suggestionsList = document.getElementById('suggestionsList');
const noSuggestions = document.getElementById('noSuggestions');
const songModal = document.getElementById('songModal');
const SONGS_KEY = 'wedding_song_suggestions';

function loadSongs() {
  return JSON.parse(localStorage.getItem(SONGS_KEY) || '[]');
}

function renderSongs() {
  const songs = loadSongs();
  songCountEl.textContent = songs.length;
  suggestionsList.innerHTML = songs.map(s => `<li>${s.text}</li>`).join('');
  noSuggestions.style.display = songs.length ? 'none' : 'block';
}
renderSongs();

document.getElementById('openSongModal').addEventListener('click', () => songModal.classList.add('open'));
document.getElementById('openSongModal2').addEventListener('click', () => songModal.classList.add('open'));

songForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('songInput');
  const songs = loadSongs();
  songs.push({ text: input.value.trim(), at: Date.now() });
  localStorage.setItem(SONGS_KEY, JSON.stringify(songs));
  input.value = '';
  renderSongs();
  songModal.classList.remove('open');
});

// ---- FAQ accordion ----
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.closest('.accordion-item').classList.toggle('open');
  });
});

// ---- RSVP (always editable, stored locally + submitted to Google Form) ----
const RSVP_KEY = 'wedding_rsvp_response';
const rsvpCard = document.getElementById('rsvpCard');
const confirmBtn = document.getElementById('confirmRsvp');
const rsvpHeadingText = document.getElementById('rsvpDeadline');
const rsvpStatus = document.getElementById('rsvpStatus');
const guestNameInput = document.getElementById('guestName');
const companionNameInput = document.getElementById('companionName');

const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScJYJw4sKhAgo2Smg0EDzoTTdpWMt8K61L9D3nMh8rTZGyEdQ/formResponse';
const GOOGLE_FORM_ENTRIES = {
  guestName: 'entry.2091283678',
  guestAttendance: 'entry.1397392961',
  companionName: 'entry.701161562',
  companionAttendance: 'entry.1829700986',
};

function getSelections() {
  const selections = {
    guestName: guestNameInput.value.trim(),
    companionName: companionNameInput.value.trim(),
  };
  rsvpCard.querySelectorAll('.rsvp-guest').forEach(guest => {
    const active = guest.querySelector('.rsvp-btn.active-si, .rsvp-btn.active-no');
    selections[guest.dataset.guest] = active ? active.dataset.answer : null;
  });
  return selections;
}

function applySelections(selections) {
  guestNameInput.value = selections.guestName || '';
  companionNameInput.value = selections.companionName || '';
  rsvpCard.querySelectorAll('.rsvp-guest').forEach(guest => {
    const answer = selections[guest.dataset.guest];
    guest.querySelectorAll('.rsvp-btn').forEach(btn => {
      btn.classList.toggle('active-si', answer === 'si' && btn.dataset.answer === 'si');
      btn.classList.toggle('active-no', answer === 'no' && btn.dataset.answer === 'no');
    });
  });
}

rsvpCard.querySelectorAll('.rsvp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const guest = btn.closest('.rsvp-guest');
    guest.querySelectorAll('.rsvp-btn').forEach(b => b.classList.remove('active-si', 'active-no'));
    btn.classList.add(btn.dataset.answer === 'si' ? 'active-si' : 'active-no');
  });
});

function submitToGoogleForm(selections) {
  const params = new URLSearchParams();
  params.append(GOOGLE_FORM_ENTRIES.guestName, selections.guestName);
  params.append(GOOGLE_FORM_ENTRIES.guestAttendance, selections.invitado === 'si' ? 'Asistiré' : 'No Asistiré');
  if (selections.companionName) {
    params.append(GOOGLE_FORM_ENTRIES.companionName, selections.companionName);
    if (selections.acompanante) {
      params.append(GOOGLE_FORM_ENTRIES.companionAttendance, selections.acompanante === 'si' ? 'Asistiré' : 'No Asistiré');
    }
  }
  return fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: params });
}

confirmBtn.addEventListener('click', () => {
  const selections = getSelections();
  if (!selections.guestName) {
    rsvpStatus.textContent = 'Por favor escribe tu nombre.';
    guestNameInput.focus();
    return;
  }
  if (!selections.invitado) {
    rsvpStatus.textContent = 'Por favor indica si asistirás.';
    return;
  }
  localStorage.setItem(RSVP_KEY, JSON.stringify(selections));
  rsvpHeadingText.textContent = '¡Gracias por confirmar! Puedes cambiar tu respuesta cuando quieras.';
  rsvpStatus.textContent = 'Enviando...';
  submitToGoogleForm(selections)
    .then(() => { rsvpStatus.textContent = 'Respuesta enviada ✓'; })
    .catch(() => { rsvpStatus.textContent = 'Guardado en este dispositivo. Revisa tu conexión e inténtalo de nuevo.'; });
});

const savedRsvp = localStorage.getItem(RSVP_KEY);
if (savedRsvp) {
  applySelections(JSON.parse(savedRsvp));
  rsvpHeadingText.textContent = '¡Gracias por confirmar! Puedes cambiar tu respuesta cuando quieras.';
}
