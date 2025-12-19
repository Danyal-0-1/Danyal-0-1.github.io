import { createScene, webglAvailable } from './scene.js';
import { createRobot } from './robot.js';
import { createParticleField, createNetworkLattice } from './particles.js';
import { initProjects } from './projects.js';
import { initAnimations, animateSkillCloud } from './animations.js';

const researchTopics = [
  'Computer vision',
  'Temporal perception',
  'Wearable motion capture',
  'Sensor fusion & IoT',
  'Embodied AI',
  'Computational media'
];

const skillTags = [
  'PyTorch (A100/Gaudi)',
  'ViT · GANs · Diffusion',
  'ESP32-C3 IMU nodes',
  'BVH export',
  'WebGL / Three.js',
  'GSAP / ScrollTrigger',
  'PiFUHD · Mixamo',
  'MongoDB logging',
  'Raspberry Pi / printers'
];

initPage();

async function initPage(){
  mountChips('#researchChips', researchTopics);
  mountChips('#skillCloud', skillTags, { asSpans: true });
  animateSkillCloud();
  initProjects();
  initAnimations();
  bindContactForm();
  animateFloatingShapes();

  if (!webglAvailable()) {
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) heroCanvas.insertAdjacentHTML('afterend', '<div class="noscript">WebGL unavailable — showing static layout.</div>');
    return;
  }

  await initHeroScene();
  await initVizScene();
}

function mountChips(selector, list, opts = {}){
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = list.map(text => {
    return opts.asSpans ? `<span class="chip">${escapeHTML(text)}</span>` : `<span class="tag">${escapeHTML(text)}</span>`;
  }).join('');
}

async function initHeroScene(){
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = createScene({ canvas });
  const pointer = { x: 0, y: 0 };
  let scrollProgress = 0;

  const robot = await createRobot(ctx.scene);
  const particles = createParticleField(ctx.scene, { count: 900, area: 7 });

  ctx.addUpdate((delta, elapsed) => {
    robot.update(delta, elapsed, { pointer, scroll: scrollProgress });
    particles.update(delta, elapsed);
  });

  window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (e.clientY / window.innerHeight - 0.5) * -2;
  }, { passive: true });

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });
}

async function initVizScene(){
  const canvas = document.getElementById('vizCanvas');
  if (!canvas) return;
  const ctx = createScene({ canvas, enableOrbit: true });
  const lattice = createNetworkLattice(ctx.scene, { nodes: 22 });
  let paused = false;

  ctx.addUpdate((delta, elapsed) => {
    if (!paused) lattice.update(delta, elapsed);
  });

  const resetBtn = document.querySelector('[data-reset-viz]');
  const pauseBtn = document.querySelector('[data-pause-viz]');
  resetBtn?.addEventListener('click', () => lattice.reset());
  pauseBtn?.addEventListener('click', () => {
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });
}

function bindContactForm(){
  const form = document.getElementById('contactForm');
  const hint = document.getElementById('formHint');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const msg = data.get('message')?.toString().trim();
    const emailValid = email && /.+@.+\..+/.test(email);

    if (!name || !emailValid || !msg) {
      hint.textContent = 'Please fill all fields with a valid email.';
      hint.style.color = '#fca5a5';
      return;
    }

    hint.textContent = 'Thanks — hook this form to your backend or service to send.';
    hint.style.color = 'var(--muted)';
    form.reset();
  });
}

function animateFloatingShapes(){
  const cluster = document.querySelector('[data-floating-shapes]');
  if (!cluster) return;
  const shapes = Array.from(cluster.children);
  let t = 0;
  function loop(){
    t += 0.01;
    shapes.forEach((s, i) => {
      const y = Math.sin(t * 1.4 + i) * 6;
      const x = Math.cos(t * 1.1 + i) * 4;
      s.style.transform = `translate(${x}px, ${y}px)`;
    });
    requestAnimationFrame(loop);
  }
  loop();
}

function escapeHTML(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}
