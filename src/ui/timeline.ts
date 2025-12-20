import type { TimelineItem } from '../types';

export function renderPublications(items: TimelineItem[]) {
  const list = document.querySelector('[data-publications]');
  if (!list) return;
  const publications = items.filter(item => item.type === 'Publication' || item.type === 'Thesis');
  list.innerHTML = publications
    .map(item => {
      return `
        <li>
          <p class="meta-label">${escapeHTML(item.year)} - ${escapeHTML(item.type)}</p>
          <strong>${escapeHTML(item.title)}</strong>
          <p class="lede">${escapeHTML(item.details)}</p>
          <span class="meta-label">${escapeHTML(item.location)}</span>
        </li>
      `;
    })
    .join('');
}

export function renderTimeline(items: TimelineItem[]) {
  const root = document.querySelector('[data-timeline]');
  if (!root) return;
  const filtered = items.filter(item => item.type !== 'Publication' && item.type !== 'Thesis');

  root.innerHTML = filtered
    .map(item => {
      return `
        <div class="timeline-item">
          <p class="meta-label">${escapeHTML(item.year)} - ${escapeHTML(item.type)}</p>
          <strong>${escapeHTML(item.title)}</strong>
          <p class="lede">${escapeHTML(item.details)}</p>
          <span class="meta-label">${escapeHTML(item.location)}</span>
        </div>
      `;
    })
    .join('');
}

function escapeHTML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
