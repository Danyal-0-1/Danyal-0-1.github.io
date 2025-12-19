import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

const fallbackProjects = [
  {
    title: 'Mesquite MoCap — Open-Source Wearable 6-DoF Motion Capture',
    year: 2025,
    type: 'Research',
    badge: 'Research / Hardware',
    tags: ['Motion capture', 'IMU', 'Sensor fusion', 'WebXR', 'Embodied AI'],
    stack: ['ESP32-C3', 'Arduino', 'Networking', 'BVH export'],
    blurb: 'Real-time full-body mocap with 15 wireless IMU nodes engineered for low cost and real-world latency budgets.',
    description: 'Co-developed firmware, synchronized networking, packet handling, fusion tuned to ~32 FPS with <15 ms latency; validated vs OptiTrack (2–5° joint error).',
    links: [{ label: 'Paper (under review)', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  },
  {
    title: 'To Wilt — MFA Thesis (4-Space Installation)',
    year: 2026,
    type: 'Artistic',
    badge: 'Computational Media',
    tags: ['LLMs', 'Installations', 'Sensors', 'Time-lapse'],
    stack: ['Web UI', 'Raspberry Pi', 'Printers', 'Blender'],
    blurb: 'Research-driven installation exploring how LLMs perform love/emotion via long-form dialogue and environmental sensing.',
    description: 'Includes multi-screen video wall, live web dialogues printed via networked printers, time-lapse decay dataset with sensor logging and reflection by multiple LLM voices.',
    links: [{ label: 'Documentation', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  },
  {
    title: 'Opuntia — Solar-Powered Sensor-Fusion Environmental Station',
    year: 2025,
    type: 'Hardware',
    badge: 'IoT / Sensing',
    tags: ['IoT', 'Telemetry', 'Power budget', 'Resilience'],
    stack: ['ESP32-C3', 'Sensors', 'MongoDB', 'Solar + BMS'],
    blurb: 'Off-grid environmental telemetry with duty cycling, timestamp integrity, and outage recovery/backfill.',
    description: 'Solar + Li-ion power stack with battery management; integrated multi-sensor logging and database-backed histories for microclimate measurement.',
    links: [{ label: 'Repo', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  },
  {
    title: 'Multi-Phone 3D Capture Rig (In progress)',
    year: 2025,
    type: 'Research',
    badge: 'Multi-view Capture',
    tags: ['Calibration', 'Synchronization', 'Motion', 'XR'],
    stack: ['Android', 'Time sync', 'Reconstruction'],
    blurb: 'Low-cost synchronized multi-phone rig for small-scale multi-view capture and XR/HRI experiments.',
    description: 'Designing 4+ phone rig with calibration and temporal sync pipelines to feed pose estimation and mesh reconstruction.',
    links: [{ label: 'Notes', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  },
  {
    title: 'Happenstance — Image-to-Avatar Pipeline',
    year: 2025,
    type: 'Research',
    badge: 'Computer Vision',
    tags: ['3D reconstruction', 'Avatars', 'Pipelines'],
    stack: ['PiFUHD', 'Mixamo', 'Rigging'],
    blurb: 'Turns a single human photograph into a rigged 3D character for rapid virtual-world import.',
    description: 'Uses PiFUHD for digitization and Mixamo for rigging; iterating toward a repeatable, faster pipeline.',
    links: [{ label: 'Demo', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  },
  {
    title: 'Temporal Fusion Transformers for S&P 500 Forecasting',
    year: 2025,
    type: 'Research',
    badge: 'Machine Learning',
    tags: ['Time series', 'TFT', 'LSTM', 'Ablations'],
    stack: ['PyTorch', 'Feature engineering', 'Mixed frequency'],
    blurb: 'Co-led S&P500 forecasting with TFT variants and LSTM baselines; mixed-frequency pipeline design.',
    description: 'Built preprocessing, alignment constraints, separate embeddings for endogenous/exogenous features; ran controlled ablations on deadlines.',
    links: [{ label: 'Report', href: '#' }],
    gallery: ['assets/img/placeholder.svg']
  }
];

export async function initProjects() {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;

  const filter = document.getElementById('filterType');
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDescription');
  const modalTech = document.getElementById('modalTech');
  const modalLinks = document.getElementById('modalLinks');
  const modalGallery = document.getElementById('modalGallery');
  const modalCategory = document.getElementById('modalCategory');

  let projects = fallbackProjects;
  try {
    const res = await fetch('assets/data/projects.json', { cache: 'no-store' });
    if (res.ok) {
      projects = await res.json();
    }
  } catch (e) {
    // stay with fallback
  }

  function render() {
    const type = filter ? filter.value : 'all';
    const list = projects.filter(p => type === 'all' || (p.type || '').toLowerCase() === type.toLowerCase());
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('.projectCard').forEach(card => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.idx);
        openModal(list[idx]);
      });
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = Number(card.dataset.idx);
          openModal(list[idx]);
        }
      });
    });
  }

  function cardHTML(p, idx) {
    const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');
    return `
      <article class="projectCard" data-idx="${idx}" tabindex="0">
        <div class="tagRow">
          <span class="tag">${escapeHTML(p.badge || p.type || 'Project')}</span>
          ${p.year ? `<span class="tag">${escapeHTML(String(p.year))}</span>` : ''}
        </div>
        <h3>${escapeHTML(p.title)}</h3>
        <p>${escapeHTML(p.blurb || '')}</p>
        <div class="tagRow" style="margin-top:8px;">${tags}</div>
      </article>
    `;
  }

  function openModal(p) {
    if (!modal) return;
    modalTitle.textContent = p.title || 'Project';
    modalDesc.textContent = p.description || p.blurb || '';
    modalCategory.textContent = p.badge || p.type || 'Project';
    modalTech.innerHTML = [...(p.stack || []), ...(p.tags || [])].slice(0, 8).map(t => `<span class="chip">${escapeHTML(t)}</span>`).join('');
    modalLinks.innerHTML = (p.links || []).map(l => `<a href="${escapeAttr(l.href || '#')}" target="_blank" rel="noopener">${escapeHTML(l.label || 'Link')}</a>`).join('');

    if (p.gallery && p.gallery.length) {
      modalGallery.innerHTML = `<img src="${escapeAttr(p.gallery[0])}" alt="${escapeAttr(p.title || 'Project image')}" />`;
    } else {
      modalGallery.innerHTML = '<div style="height:100%;display:grid;place-items:center;color:rgba(255,255,255,0.7);">Add media</div>';
    }

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    if (gsap) {
      gsap.fromTo('.modal__card', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' });
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  modal?.querySelectorAll('[data-close-modal]').forEach(btn => btn.addEventListener('click', closeModal));
  modal?.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  if (filter) filter.addEventListener('change', render);

  render();
  addTiltEffect(grid);
}

function addTiltEffect(grid) {
  grid.addEventListener('pointermove', e => {
    const card = e.target.closest('.projectCard');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const rx = ((cy / rect.height) - 0.5) * -10;
    const ry = ((cx / rect.width) - 0.5) * 10;
    card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  });
  grid.addEventListener('pointerleave', () => {
    grid.querySelectorAll('.projectCard').forEach(c => c.style.transform = '');
  });
}

function escapeHTML(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
function escapeAttr(str) {
  return String(str).replaceAll('"', '&quot;');
}
