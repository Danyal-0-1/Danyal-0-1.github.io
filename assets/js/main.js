(async function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const y = $('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  // Clock
  const clock = $('[data-clock]');
  function tick(){
    if (!clock) return;
    const d = new Date();
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    const ss = String(d.getSeconds()).padStart(2,'0');
    clock.textContent = `${hh}:${mm}:${ss}`;
  }
  tick();
  setInterval(tick, 1000);

  // Scroll percentage
  const scrollpct = $('[data-scrollpct]');
  function updateScrollPct(){
    if (!scrollpct) return;
    const doc = document.documentElement;
    const max = (doc.scrollHeight - doc.clientHeight) || 1;
    const pct = Math.round((doc.scrollTop / max) * 100);
    scrollpct.textContent = `${pct}%`;
  }
  updateScrollPct();
  window.addEventListener('scroll', updateScrollPct, {passive:true});

  // Mobile nav toggle
  const navToggle = $('[data-nav-toggle]');
  const navMenu = $('[data-nav-menu]');
  if (navToggle && navMenu){
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close on link tap (mobile)
    $$('.nav__link', navMenu).forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Mode toggle (Archive vs Lab)
  const modeBtn = $('[data-mode-toggle]');
  const modeLabel = $('[data-mode-label]');
  const KEY = 'dk_site_mode';

  function setMode(mode){
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem(KEY, mode);
    if (modeLabel){
      modeLabel.textContent = (mode === 'lab') ? 'Lab Mode' : 'Archive Mode';
    }
  }

  if (modeBtn){
    const saved = localStorage.getItem(KEY);
    if (saved === 'lab' || saved === 'archive') setMode(saved);
    modeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-mode') || 'archive';
      setMode(current === 'archive' ? 'lab' : 'archive');
    });
  }

  // Load profile.json if present (index + cv)
  async function loadJSON(path){
    const res = await fetch(path, {cache: 'no-store'});
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  try{
    const profile = await loadJSON('assets/data/profile.json');

    const lead = $('#profileLead');
    if (lead) lead.textContent = profile.lead;

    const chips = $('#interestChips');
    if (chips && Array.isArray(profile.interests)){
      chips.innerHTML = profile.interests.map(t => (
        `<span class="tag">${escapeHTML(t)}</span>`
      )).join('');
    }

    const facts = $('#facts');
    if (facts && profile.facts){
      facts.innerHTML = Object.entries(profile.facts).map(([k,v]) => (
        `<div class="facts__row"><span class="facts__k">${escapeHTML(k)}</span><span class="facts__v">${escapeHTML(v)}</span></div>`
      )).join('');
    }

    const contact = $('#contactBlock');
    if (contact && profile.contact){
      contact.innerHTML = `
        <div><span class="monoSmall">Email:</span> <a class="link" href="mailto:${encodeURIComponent(profile.contact.email)}">${escapeHTML(profile.contact.email)}</a></div>
        <div><span class="monoSmall">Website:</span> <a class="link" href="${escapeAttr(profile.contact.website)}" target="_blank" rel="noopener">${escapeHTML(profile.contact.website)}</a></div>
        ${profile.contact.phone ? `<div><span class="monoSmall">Phone:</span> ${escapeHTML(profile.contact.phone)}</div>` : ``}
      `;
    }

    const cvSummary = $('#cvSummary');
    if (cvSummary && profile.cv_summary_html){
      cvSummary.innerHTML = profile.cv_summary_html;
    }

  }catch(e){
    // If profile.json is missing, don't hard fail.
    // console.warn(e);
  }

  // Index: load highlights from projects.json if present
  try{
    const highlightsEl = $('#highlights');
    if (highlightsEl){
      const projects = await loadJSON('assets/data/projects.json');
      const hi = (projects || []).filter(p => p.highlight).slice(0, 6);
      highlightsEl.innerHTML = hi.map(p => projectCardHTML(p)).join('');
    }
  }catch(e){
    // ignore
  }

  function projectCardHTML(p){
    const tags = (p.tags || []).slice(0, 3).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');
    return `
      <article class="card">
        <div class="card__top">
          <span class="tag">${escapeHTML(p.category || 'Project')}</span>
          ${tags}
        </div>
        <h3 class="h3">${escapeHTML(p.title || 'Untitled')}</h3>
        <p class="sub">${escapeHTML(p.blurb || '')}</p>
        <div class="divider"></div>
        <div class="monoSmall">
          ${p.year ? `<span>${escapeHTML(String(p.year))}</span>` : ``}
          ${p.stack ? ` • <span>${escapeHTML(p.stack.join(' · '))}</span>` : ``}
        </div>
      </article>
    `;
  }

  function escapeHTML(str){
    return String(str)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'","&#039;");
  }
  function escapeAttr(str){
    return String(str).replaceAll('"','&quot;');
  }
})();
