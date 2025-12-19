(async function(){
  const $ = (sel, root=document) => root.querySelector(sel);

  async function loadJSON(path){
    const res = await fetch(path, {cache:'no-store'});
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return res.json();
  }

  const grid = $('#projectGrid');
  if (!grid) return;

  const searchEl = $('[data-search]');
  const catEl = $('[data-category]');
  const tagEl = $('[data-tag]');
  const resetBtn = $('[data-reset]');
  const resultCount = document.querySelector('[data-resultcount]');

  const projects = await loadJSON('assets/data/projects.json');

  const categories = uniq(projects.map(p => p.category).filter(Boolean)).sort();
  const tags = uniq(projects.flatMap(p => p.tags || [])).sort();

  categories.forEach(c => catEl.insertAdjacentHTML('beforeend', `<option value="${escapeAttr(c)}">${escapeHTML(c)}</option>`));
  tags.forEach(t => tagEl.insertAdjacentHTML('beforeend', `<option value="${escapeAttr(t)}">${escapeHTML(t)}</option>`));

  function render(){
    const q = (searchEl.value || '').trim().toLowerCase();
    const cat = catEl.value || 'all';
    const tag = tagEl.value || 'all';

    const filtered = projects.filter(p => {
      const hay = [
        p.title, p.blurb, p.details,
        (p.tags || []).join(' '),
        (p.stack || []).join(' '),
        p.category
      ].filter(Boolean).join(' ').toLowerCase();

      if (q && !hay.includes(q)) return false;
      if (cat !== 'all' && p.category !== cat) return false;
      if (tag !== 'all' && !(p.tags || []).includes(tag)) return false;
      return true;
    });

    grid.innerHTML = filtered.map(projectHTML).join('');
    if (resultCount) resultCount.textContent = String(filtered.length);
  }

  function projectHTML(p){
    const tags = (p.tags || []).map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('');
    const stack = (p.stack || []).map(s => `<span class="tag">${escapeHTML(s)}</span>`).join('');
    const links = (p.links || []).map(l => {
      const label = escapeHTML(l.label || 'Link');
      const href = escapeAttr(l.href || '#');
      return `<a class="link" href="${href}" target="_blank" rel="noopener">${label}</a>`;
    }).join(' · ');

    return `
      <article class="card">
        <div class="card__top">
          <span class="tag">${escapeHTML(p.category || 'Project')}</span>
          ${p.year ? `<span class="tag">${escapeHTML(String(p.year))}</span>` : ``}
        </div>

        <h3 class="h3">${escapeHTML(p.title || 'Untitled')}</h3>
        <p class="sub">${escapeHTML(p.blurb || '')}</p>

        ${p.details ? `<p class="lead">${escapeHTML(p.details)}</p>` : ``}

        <div class="divider"></div>

        <div class="monoSmall"><b>Tags</b></div>
        <div class="card__top">${tags || `<span class="tag">—</span>`}</div>

        <div style="height:10px"></div>

        <div class="monoSmall"><b>Stack</b></div>
        <div class="card__top">${stack || `<span class="tag">—</span>`}</div>

        ${links ? `<div class="divider"></div><div class="monoSmall">${links}</div>` : ``}
      </article>
    `;
  }

  function uniq(arr){ return Array.from(new Set(arr)); }

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

  searchEl.addEventListener('input', render);
  catEl.addEventListener('change', render);
  tagEl.addEventListener('change', render);
  resetBtn.addEventListener('click', () => {
    searchEl.value = '';
    catEl.value = 'all';
    tagEl.value = 'all';
    render();
  });

  render();
})();
