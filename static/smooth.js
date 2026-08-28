(function () {

  // ── Page loader
  const loader = document.getElementById('page-loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 850);
  });

  // ── Hero spotlight
  const spotlight = document.querySelector('.global-spotlight');

document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth * 100).toFixed(1);
  const y = (e.clientY / window.innerHeight * 100).toFixed(1);
  spotlight.style.setProperty('--mx', x + '%');
  spotlight.style.setProperty('--my', y + '%');
  spotlight.style.opacity = '1';
});

document.addEventListener('mouseleave', () => {
  spotlight.style.opacity = '0';
});

  // ── Header scrolled class
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // ── Scroll reveal
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.005, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));

})();


// ── Scrollbar — belt according to scroll position ────────────────────────
const beltStages = [
  { color: '#ffffff', stripe: null },       // white
  { color: '#ffffff', stripe: '#f4d900' },  // gold stripe
  { color: '#f4d900', stripe: null },       // gold
  { color: '#f4d900', stripe: '#0e7a3c' },  // green stripe
  { color: '#0e7a3c', stripe: null },       // green
  { color: '#0e7a3c', stripe: '#1c2f6e' },  // blue stripe
  { color: '#1c2f6e', stripe: null },       // blue
  { color: '#1c2f6e', stripe: '#d0202a' },  // red stripe
  { color: '#d0202a', stripe: null },       // red
  { color: '#d0202a', stripe: '#0a0a0a' },  // black stripe
  { color: '#0a0a0a', stripe: null },       // black
];

function interpolateColor(a, b, t) {
  const r1 = parseInt(a.slice(1,3),16), g1 = parseInt(a.slice(3,5),16), b1 = parseInt(a.slice(5,7),16);
  const r2 = parseInt(b.slice(1,3),16), g2 = parseInt(b.slice(3,5),16), b2 = parseInt(b.slice(5,7),16);

  const r = Math.round(r1 + (r2-r1)*t);
  const g = Math.round(g1 + (g2-g1)*t);
  const bl = Math.round(b1 + (b2-b1)*t);

  return `rgb(${r},${g},${bl})`;
}

const beltThumb = document.getElementById('belt-thumb');
const beltTrack = document.getElementById('belt-track');

function updateBeltScrollbar() {
  if (!beltThumb || !beltTrack) return;

  const scrollTop = window.scrollY;
  const scrollHeight = document.body.scrollHeight - window.innerHeight;
  const pct = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;

  const trackH = beltTrack.clientHeight;
  const thumbH = Math.max(trackH * 0.14, 60);
  const top = pct * (trackH - thumbH);

  beltThumb.style.height = thumbH + 'px';
  beltThumb.style.top = top + 'px';

  const stageCount = beltStages.length;
  const index = Math.min(Math.floor(pct * stageCount), stageCount - 1);
  const next  = Math.min(index + 1, stageCount - 1);
  const localPct = (pct * stageCount) - index;

  const stage = beltStages[index];
  const nextStage = beltStages[next];

  // Belt body color
  const color = interpolateColor(stage.color, nextStage.color, localPct);
  document.documentElement.style.setProperty('--belt-color', color);

  // Stripe — appears if the current level has a defined stripe
  if (stage.stripe) {
    document.documentElement.style.setProperty('--stripe-color', stage.stripe);
    document.documentElement.style.setProperty('--stripe-opacity', '1');
  } else {
    document.documentElement.style.setProperty('--stripe-opacity', '0');
  }
}

window.addEventListener('scroll', updateBeltScrollbar, { passive: true });
window.addEventListener('resize', updateBeltScrollbar);
updateBeltScrollbar();


// ── Contact form — validation + submission ───────────
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();

  let valid = true;

  this.querySelectorAll('input[required]').forEach(field => {
    const errorEl = this.querySelector(`.form-error[data-for="${field.id}"]`);

    // For checkbox (consent), check "checked".
    // For text fields, check whether the value is filled.
    const isValid = field.type === 'checkbox' ? field.checked : field.value.trim();

    if (!isValid) {
      field.classList.add('invalid');

      if (errorEl) errorEl.classList.add('visible');
      valid = false;

    } else {
      field.classList.remove('invalid');

      if (errorEl) errorEl.classList.remove('visible');
    }
  });

  if (valid) {
    this.submit(); // Actually submits the form to the server (POST /submit)
  }
});


// ── Punching bag (interactive swinging following the mouse) ─────────────────
(function () {

  const hero = document.querySelector('.hero');
  const bag = document.getElementById('punchingBag');

  if (!hero || !bag) return;

  let angle = 0;
  let angularVel = 0;
  let targetAngle = 0;

  const stiffness = 0.06;      // How quickly the bag reaches the target angle
  const damping = 0.90;        // Swing damping (closer to 1 = longer swinging)
  const maxAngle = 18;         // Maximum swing angle in degrees
  const influenceRadius = 260; // Mouse influence range in px

  hero.addEventListener('mousemove', (e) => {

    const rect = bag.getBoundingClientRect();
    const bagCenterX = rect.left + rect.width / 2;
    const dx = e.clientX - bagCenterX;

    if (Math.abs(dx) < influenceRadius) {

      const strength = 1 - Math.abs(dx) / influenceRadius;

      targetAngle = Math.max(-maxAngle, Math.min(maxAngle,
        (dx / influenceRadius) * maxAngle * (0.5 + strength)));

    } else {
      targetAngle = 0;
    }

  });

  hero.addEventListener('mouseleave', () => {
    targetAngle = 0;
  });


  function animate() {

    angularVel += (targetAngle - angle) * stiffness;
    angularVel *= damping;
    angle += angularVel;

    bag.style.transform = `rotate(${angle}deg)`;

    requestAnimationFrame(animate);
  }

  animate();

})();