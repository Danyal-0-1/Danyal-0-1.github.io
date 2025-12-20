import './styles.css';
import profile from './content/profile.json';
import projects from './content/projects.json';
import timeline from './content/timeline.json';
import type { Profile, Project, TimelineItem } from './types';
import { initProjects } from './ui/projects';
import { renderPublications, renderTimeline } from './ui/timeline';
import { initChat } from './ui/chat';
import { initNav } from './ui/nav';
import { initQualityToggle } from './ui/qualityToggle';
import { initWebGL } from './webgl/renderer';
import { initScrollChapters } from './webgl/scroll';

const typedProfile = profile as Profile;
const typedProjects = projects as Project[];
const typedTimeline = timeline as TimelineItem[];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reducedMotion) {
  document.body.classList.add('reduced-motion');
}

const webgl = initWebGL({
  canvas: document.getElementById('webgl-canvas') as HTMLCanvasElement,
  reducedMotion
});

if (webgl && !reducedMotion) {
  initScrollChapters({
    webgl,
    sections: {
      hero: document.getElementById('hero'),
      projects: document.getElementById('projects'),
      about: document.getElementById('about'),
      timeline: document.getElementById('timeline')
    }
  });
} else if (webgl) {
  webgl.setChapterOpacity({ latent: 1, simulation: 0.2, graph: 0 });
}

if (webgl) {
  webgl.bindOrbitZone(
    document.querySelector('[data-orbit-zone]'),
    document.querySelector('[data-orbit-status]')
  );
}

initQualityToggle(webgl);
initNav();
renderProfile(typedProfile);
renderPublications(typedTimeline);
renderTimeline(typedTimeline);
initProjects({ projects: typedProjects, onOpen: () => webgl?.triggerPulse() });
initChat({ profile: typedProfile, projects: typedProjects, timeline: typedTimeline });
initContactForm();

function renderProfile(data: Profile) {
  const nameEls = document.querySelectorAll('[data-profile-name]');
  nameEls.forEach(el => (el.textContent = data.name));

  const programEls = document.querySelectorAll('[data-profile-program]');
  programEls.forEach(el => (el.textContent = data.program));

  const locationEls = document.querySelectorAll('[data-profile-location]');
  locationEls.forEach(el => (el.textContent = data.location));

  const heroTitle = document.querySelector('[data-hero-title]');
  if (heroTitle) {
    heroTitle.textContent = `${data.name} - ${data.program}`;
  }

  const focus = document.querySelector('[data-hero-focus]');
  if (focus) {
    focus.textContent = `Focused on ${data.researchInterests.slice(0, 3).join(', ')} with a research practice spanning ${data.researchInterests.slice(3).join(', ')}.`;
  }

  const featuredFocus = document.querySelector('[data-featured-focus]');
  if (featuredFocus) {
    featuredFocus.textContent = `Currently exploring ${data.researchInterests.slice(0, 2).join(' and ')} with an emphasis on real-world sensor reliability.`;
  }

  const interests = document.querySelector('[data-interests]');
  if (interests) {
    interests.innerHTML = data.researchInterests.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  }

  const skills = document.querySelector('[data-skills]');
  if (skills) {
    const coreSkills = [
      ...data.skills.programmingData.slice(0, 2),
      ...data.skills.embeddedHardware.slice(0, 2),
      ...data.skills.imaging3DXR.slice(0, 2)
    ];
    skills.innerHTML = coreSkills.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  }

  const aboutCopy = document.querySelector('[data-about-copy]');
  if (aboutCopy) {
    aboutCopy.textContent = `${data.program}. Research spans ${data.researchInterests.join(', ')} with a focus on embodied AI systems and resilient sensing pipelines.`;
  }

  const affiliations = document.querySelector('[data-affiliations]');
  if (affiliations) {
    affiliations.innerHTML = data.affiliations.map(item => `<li>${escapeHTML(item)}</li>`).join('');
  }

  const affiliationShort = document.querySelector('[data-profile-affiliations]');
  if (affiliationShort) {
    affiliationShort.textContent = data.affiliations.slice(0, 2).join(' - ');
  }

  const coursework = document.querySelector('[data-coursework]');
  if (coursework) {
    coursework.innerHTML = data.coursework.map(item => `<li>${escapeHTML(item)}</li>`).join('');
  }

  const skillProgramming = document.querySelector('[data-skills-programming]');
  if (skillProgramming) {
    skillProgramming.innerHTML = data.skills.programmingData.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  }

  const skillEmbedded = document.querySelector('[data-skills-embedded]');
  if (skillEmbedded) {
    skillEmbedded.innerHTML = data.skills.embeddedHardware.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  }

  const skillImaging = document.querySelector('[data-skills-imaging]');
  if (skillImaging) {
    skillImaging.innerHTML = data.skills.imaging3DXR.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join('');
  }

  const emailLink = document.querySelector('[data-profile-email]') as HTMLAnchorElement | null;
  if (emailLink) {
    emailLink.href = `mailto:${data.email}`;
    emailLink.textContent = data.email;
  }

  const siteLink = document.querySelector('[data-profile-website]') as HTMLAnchorElement | null;
  if (siteLink) {
    siteLink.href = data.website;
    siteLink.textContent = data.website.replace('https://', '');
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

function initContactForm() {
  const form = document.querySelector('[data-contact-form]') as HTMLFormElement | null;
  const hint = document.querySelector('[data-form-hint]');
  if (!form || !hint) return;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    const email = data.get('email')?.toString().trim();
    const message = data.get('message')?.toString().trim();
    const validEmail = !!email && /.+@.+\..+/.test(email);

    if (!name || !validEmail || !message) {
      hint.textContent = 'Please complete all fields with a valid email.';
      hint.setAttribute('style', 'color: #c2410c;');
      return;
    }

    hint.textContent = 'Thanks. Your message is validated locally.';
    hint.setAttribute('style', 'color: var(--muted);');
    form.reset();
  });
}

function escapeHTML(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
