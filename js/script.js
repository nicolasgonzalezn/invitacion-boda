// ---- Config ----
const WEDDING_DATE = new Date('2026-12-12T17:30:00');

// ---- Loader / entry gate ----
// Browsers never allow audio-with-sound to autoplay on page load or on scroll —
// every real site that opens with music (this one included) needs one genuine
// tap/click to unlock it. So the loader becomes a "tap to enter" gate once the
// page is ready: that single click both reveals the invitation and starts the
// background track, in the same trusted gesture.
window.addEventListener('load', () => {
  document.getElementById('loaderLoading').style.display = 'none';
  document.getElementById('enterButton').style.display = 'flex';
});

document.getElementById('enterButton').addEventListener('click', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
  setTimeout(() => loader.remove(), 700);
  attemptBgAudioAutostart();
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

// Close the mobile menu on an outside tap/click or Escape — otherwise the only
// way out was picking a section link.
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !navToggle.contains(e.target)) {
    navLinks.classList.remove('open');
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') navLinks.classList.remove('open');
});

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

// ---- Background music (floating button controls this, and only this) ----
const musicToggle = document.getElementById('musicToggle');
const iconPlay = document.getElementById('iconPlay');
const iconPause = document.getElementById('iconPause');
const bgAudio = document.getElementById('bgAudio');
const BG_AUDIO_START = 65; // 1:05

let bgAudioStarted = false;

function setMusicIcon(isPlaying) {
  iconPlay.style.display = isPlaying ? 'none' : 'block';
  iconPause.style.display = isPlaying ? 'block' : 'none';
}

// Browsers block audio autoplay without a user gesture. bgAudioStarted is claimed
// synchronously (not inside the play() promise) so two triggers firing off the
// same event can't both call play() and race each other's currentTime seek.
// currentTime is set on the 'playing' event (playback has genuinely begun) rather
// than on the play() promise resolving, since on iOS Safari a seek made any
// earlier is silently ignored and playback keeps going from 0:00.
//
// This is intentionally NOT attempted on window 'load' — some embedded webviews
// (e.g. WhatsApp Desktop's in-app browser) are far more permissive about autoplay
// than real browsers and would let it start before the guest ever taps "Toca
// para comenzar". Playback should only ever begin from a genuine interaction.
function attemptBgAudioAutostart() {
  if (bgAudioStarted) return;
  bgAudioStarted = true;
  bgAudio.addEventListener('playing', () => {
    bgAudio.currentTime = BG_AUDIO_START;
  }, { once: true });
  bgAudio.play().catch(() => { bgAudioStarted = false; });
}

bgAudio.addEventListener('ended', () => {
  bgAudio.currentTime = BG_AUDIO_START;
  bgAudio.play();
});
bgAudio.addEventListener('play', () => setMusicIcon(true));
bgAudio.addEventListener('pause', () => setMusicIcon(false));

['pointerdown', 'mousedown', 'touchend', 'keydown', 'click', 'wheel'].forEach(evt => {
  document.addEventListener(evt, attemptBgAudioAutostart, { once: true, passive: true });
});

musicToggle.addEventListener('click', () => {
  if (!bgAudioStarted) {
    attemptBgAudioAutostart();
  } else if (bgAudio.paused) {
    bgAudio.play().catch(() => {});
  } else {
    bgAudio.pause();
  }
});

// ---- Gallery carousel lightbox (with prev/next through that carousel's photos) ----
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentGallery = [];
let currentIndex = 0;

function showLightboxImage(index) {
  currentIndex = (index + currentGallery.length) % currentGallery.length;
  lightboxContent.innerHTML = `<img src="${currentGallery[currentIndex]}" alt="">`;
}

document.querySelectorAll('.section-carousel').forEach(section => {
  const gallery = [...section.querySelectorAll('.carousel-track img:not([aria-hidden])')].map(img => img.src);
  section.querySelectorAll('.carousel-track img').forEach(img => {
    img.addEventListener('click', () => {
      currentGallery = gallery;
      showLightboxImage(gallery.indexOf(img.src));
      lightbox.classList.add('open');
    });
  });
});

lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); showLightboxImage(currentIndex - 1); });
lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); showLightboxImage(currentIndex + 1); });

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxContent.innerHTML = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft') showLightboxImage(currentIndex - 1);
  else if (e.key === 'ArrowRight') showLightboxImage(currentIndex + 1);
  else if (e.key === 'Escape') closeLightbox();
});

// ---- FAQ accordion ----
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    trigger.closest('.accordion-item').classList.toggle('open');
  });
});

// ---- RSVP (one guest per submission — resets after each send for the +1) ----
const rsvpCard = document.getElementById('rsvpCard');
const confirmBtn = document.getElementById('confirmRsvp');
const rsvpStatus = document.getElementById('rsvpStatus');
const guestNameInput = document.getElementById('guestName');
const dietaryInput = document.getElementById('dietaryRestriction');
const funFactInput = document.getElementById('funFact');
const rsvpConfirmModal = document.getElementById('rsvpConfirmModal');
const rsvpConfirmText = document.getElementById('rsvpConfirmText');

const GOOGLE_FORM_ACTION = 'https://docs.google.com/forms/d/e/1FAIpQLScJYJw4sKhAgo2Smg0EDzoTTdpWMt8K61L9D3nMh8rTZGyEdQ/formResponse';
const GOOGLE_FORM_ENTRIES = {
  guestName: 'entry.2091283678',
  guestAttendance: 'entry.1397392961',
  dietaryRestriction: 'entry.701161562',
  funFact: 'entry.1829700986',
};

rsvpCard.querySelectorAll('.rsvp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    rsvpCard.querySelectorAll('.rsvp-btn').forEach(b => b.classList.remove('active-si', 'active-no'));
    btn.classList.add(btn.dataset.answer === 'si' ? 'active-si' : 'active-no');
  });
});

function getAttendance() {
  const active = rsvpCard.querySelector('.rsvp-btn.active-si, .rsvp-btn.active-no');
  return active ? active.dataset.answer : null;
}

function submitToGoogleForm({ guestName, attendance, dietaryRestriction, funFact }) {
  const params = new URLSearchParams();
  params.append(GOOGLE_FORM_ENTRIES.guestName, guestName);
  params.append(GOOGLE_FORM_ENTRIES.guestAttendance, attendance === 'si' ? 'Asistiré' : 'No Asistiré');
  if (dietaryRestriction) params.append(GOOGLE_FORM_ENTRIES.dietaryRestriction, dietaryRestriction);
  if (funFact) params.append(GOOGLE_FORM_ENTRIES.funFact, funFact);
  return fetch(GOOGLE_FORM_ACTION, { method: 'POST', mode: 'no-cors', body: params });
}

function resetRsvpForm() {
  guestNameInput.value = '';
  dietaryInput.value = '';
  funFactInput.value = '';
  rsvpCard.querySelectorAll('.rsvp-btn').forEach(b => b.classList.remove('active-si', 'active-no'));
  confirmBtn.classList.remove('is-sent');
  rsvpStatus.textContent = '';
}

confirmBtn.addEventListener('click', () => {
  const guestName = guestNameInput.value.trim();
  const attendance = getAttendance();
  if (!guestName) {
    rsvpStatus.textContent = 'Por favor escribe tu nombre.';
    guestNameInput.focus();
    return;
  }
  if (!attendance) {
    rsvpStatus.textContent = 'Por favor indica si asistirás.';
    return;
  }

  const dietaryRestriction = dietaryInput.value.trim();
  const funFact = funFactInput.value.trim();

  confirmBtn.classList.add('is-sent');
  rsvpStatus.textContent = '';
  rsvpConfirmText.textContent = `Respuesta de ${guestName} recibida`;
  rsvpConfirmModal.classList.add('open');

  submitToGoogleForm({ guestName, attendance, dietaryRestriction, funFact }).catch(() => {});

  setTimeout(() => {
    rsvpConfirmModal.classList.remove('open');
    resetRsvpForm();
  }, 1800);
});
