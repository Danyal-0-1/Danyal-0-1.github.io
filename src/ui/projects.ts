import type { Project } from '../types';

type ProjectsInit = {
  projects: Project[];
  onOpen?: (project: Project) => void;
};

const ORDERED_CATEGORIES = ['All', 'Research', 'Hardware', 'Artistic', 'Coursework'];

export function initProjects({ projects, onOpen }: ProjectsInit) {
  const filterRoot = document.querySelector('[data-project-filters]');
  const grid = document.getElementById('projectGrid');
  const modal = document.getElementById('projectModal');

  if (!filterRoot || !grid || !modal) return;

  const categories = ORDERED_CATEGORIES.filter(cat =>
    cat === 'All' || projects.some(project => project.category === cat)
  );

  let activeCategory = 'All';
  renderFilters(filterRoot as HTMLElement, categories, activeCategory, category => {
    activeCategory = category;
    renderCards();
  });

  const closeButtons = modal.querySelectorAll('[data-close-modal]');
  closeButtons.forEach(btn => btn.addEventListener('click', closeModal));
  modal.addEventListener('click', event => {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  renderCards();

  function renderCards() {
    const visible = activeCategory === 'All'
      ? projects
      : projects.filter(project => project.category === activeCategory);

    grid.innerHTML = visible.map(cardMarkup).join('');
    grid.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const projectId = card.getAttribute('data-id');
        const project = visible.find(item => item.id === projectId);
        if (project) openModal(project);
      });
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          const projectId = card.getAttribute('data-id');
          const project = visible.find(item => item.id === projectId);
          if (project) openModal(project);
        }
      });
    });
  }

  function openModal(project: Project) {
    const title = modal.querySelector('[data-modal-title]');
    const summary = modal.querySelector('[data-modal-summary]');
    const category = modal.querySelector('[data-modal-category]');
    const start = modal.querySelector('[data-modal-start]');
    const status = modal.querySelector('[data-modal-status]');
    const location = modal.querySelector('[data-modal-location]');
    const problem = modal.querySelector('[data-modal-problem]');
    const contributions = modal.querySelector('[data-modal-contributions]');
    const tech = modal.querySelector('[data-modal-tech]');
    const outcomes = modal.querySelector('[data-modal-outcomes]');
    const links = modal.querySelector('[data-modal-links]');
    const gallery = modal.querySelector('[data-modal-gallery]');

    if (title) title.textContent = project.title;
    if (summary) summary.textContent = project.summary;
    if (category) category.textContent = project.category;
    if (start) start.textContent = formatStart(project.startDate.label, project.startDate.precision);
    if (status) status.textContent = project.status;
    if (location) location.textContent = project.location;
    if (problem) problem.textContent = project.problem;
    if (contributions) {
      contributions.innerHTML = project.contributions.map(item => `<li>${escapeHTML(item)}</li>`).join('');
    }
    if (tech) {
      tech.innerHTML = project.techStack.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
    }
    if (outcomes) {
      outcomes.innerHTML = project.outcomes.map(item => `<li>${escapeHTML(item)}</li>`).join('');
    }
    if (links) {
      links.innerHTML = renderLinks(project.links);
    }
    if (gallery) {
      gallery.innerHTML = '';
      if (project.gallery && project.gallery.length) {
        project.gallery.forEach(image => {
          const img = document.createElement('img');
          img.src = resolvePublicPath(image.src);
          img.alt = image.alt;
          img.addEventListener('error', () => replaceWithPlaceholder(img));
          gallery.appendChild(img);
        });
      } else {
        gallery.appendChild(createPlaceholder());
      }
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trapFocus(modal);
    onOpen?.(project);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    releaseFocus(modal);
  }
}

function renderFilters(root: HTMLElement, categories: string[], active: string, onSelect: (category: string) => void) {
  root.innerHTML = categories
    .map(category => {
      const activeClass = category === active ? 'filter-btn is-active' : 'filter-btn';
      return `<button class="${activeClass}" type="button" data-category="${category}">${category}</button>`;
    })
    .join('');

  root.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-category') || 'All';
      root.querySelectorAll('button').forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      onSelect(category);
    });
  });
}

function cardMarkup(project: Project) {
  const tech = project.techStack.slice(0, 3).map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  return `
    <article class="project-card" tabindex="0" role="button" aria-label="Open project ${escapeHTML(project.title)}" data-id="${project.id}">
      <p class="meta-label">${escapeHTML(project.category)}</p>
      <h3>${escapeHTML(project.title)}</h3>
      <p class="lede">${escapeHTML(project.summary)}</p>
      <div class="tags" style="margin-top: 12px;">${tech}</div>
    </article>
  `;
}

function renderLinks(links: Project['links']) {
  const entries = Object.entries(links).map(([key, value]) => {
    if (!value) {
      return `<span class="tag">${key}</span>`;
    }
    return `<a class="link" href="${value}" target="_blank" rel="noopener">${key}</a>`;
  });
  return entries.join(' ');
}

function replaceWithPlaceholder(img: HTMLImageElement) {
  const placeholder = createPlaceholder();
  img.replaceWith(placeholder);
}

function createPlaceholder() {
  const div = document.createElement('div');
  div.className = 'gallery-placeholder';
  div.textContent = 'Image placeholder';
  return div;
}

function resolvePublicPath(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}${normalized}`;
}

function formatStart(label: string, precision: string) {
  if (precision === 'approx' && !/Approx/i.test(label)) {
    return `${label} (approx.)`;
  }
  return label;
}

let lastFocused: HTMLElement | null = null;
let focusHandler: ((event: KeyboardEvent) => void) | null = null;

function trapFocus(modal: HTMLElement) {
  lastFocused = document.activeElement as HTMLElement;
  const focusable = getFocusableElements(modal);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (first) first.focus();

  focusHandler = event => {
    if (event.key !== 'Tab') return;
    if (focusable.length === 0) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  modal.addEventListener('keydown', focusHandler);
}

function releaseFocus(modal: HTMLElement) {
  if (focusHandler) {
    modal.removeEventListener('keydown', focusHandler);
  }
  lastFocused?.focus();
  lastFocused = null;
}

function getFocusableElements(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  ).filter(el => !el.hasAttribute('disabled'));
}

function escapeHTML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
