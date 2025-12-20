import type { Profile, Project, TimelineItem, AssistantMessage } from '../types';
import { LocalAssistantClient } from '../ai/client';

type ChatInit = {
  profile: Profile;
  projects: Project[];
  timeline: TimelineItem[];
};

const suggested = [
  'What is Mesquite MoCap?',
  'What are your XR interests?',
  'Publications and thesis?',
  'Tell me about To Wilt.'
];

export function initChat({ profile, projects, timeline }: ChatInit) {
  const drawer = document.getElementById('assistantDrawer');
  const openButton = document.querySelector('[data-open-chat]') as HTMLButtonElement | null;
  const closeButtons = drawer?.querySelectorAll('[data-close-drawer]') || [];
  const messagesEl = drawer?.querySelector('[data-assistant-messages]');
  const suggestionsEl = drawer?.querySelector('[data-assistant-suggestions]');
  const form = drawer?.querySelector('[data-assistant-form]') as HTMLFormElement | null;
  const input = form?.querySelector('input') as HTMLInputElement | null;

  if (!drawer || !openButton || !messagesEl || !suggestionsEl || !form || !input) return;

  const client = new LocalAssistantClient({ profile, projects, timeline });

  const initialMessage: AssistantMessage = {
    role: 'assistant',
    content: `Ask me about ${profile.name}'s research, projects, or publications.`
  };

  renderMessage(messagesEl, initialMessage);
  renderSuggestions(suggestionsEl, suggested, question => {
    input.value = question;
    form.requestSubmit();
  });

  openButton.addEventListener('click', () => openDrawer(drawer, input));
  closeButtons.forEach(btn => btn.addEventListener('click', () => closeDrawer(drawer)));
  drawer.addEventListener('click', event => {
    if ((event.target as HTMLElement).classList.contains('drawer-backdrop')) closeDrawer(drawer);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(drawer);
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question) return;

    renderMessage(messagesEl, { role: 'user', content: question });
    input.value = '';

    const response = await client.ask(question);
    renderMessage(messagesEl, response);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

function renderSuggestions(container: Element, items: string[], onPick: (value: string) => void) {
  container.innerHTML = items
    .map(item => `<button type="button">${escapeHTML(item)}</button>`)
    .join('');
  container.querySelectorAll('button').forEach((button, index) => {
    button.addEventListener('click', () => onPick(items[index]));
  });
}

function renderMessage(container: Element, message: AssistantMessage) {
  const div = document.createElement('div');
  div.className = `assistant-message ${message.role}`;
  div.textContent = message.content;
  container.appendChild(div);
}

let lastFocused: HTMLElement | null = null;
let focusHandler: ((event: KeyboardEvent) => void) | null = null;

function openDrawer(drawer: HTMLElement, focusTarget: HTMLElement) {
  lastFocused = document.activeElement as HTMLElement;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  focusTarget.focus();
  trapFocus(drawer);
}

function closeDrawer(drawer: HTMLElement) {
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  releaseFocus(drawer);
}

function trapFocus(drawer: HTMLElement) {
  const focusable = getFocusableElements(drawer);
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

  drawer.addEventListener('keydown', focusHandler);
}

function releaseFocus(drawer: HTMLElement) {
  if (focusHandler) drawer.removeEventListener('keydown', focusHandler);
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
