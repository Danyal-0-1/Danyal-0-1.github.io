import type { QualityLevel } from '../types';
import type { WebGLController } from '../webgl/renderer';

const STORAGE_KEY = 'dk_quality';

export function initQualityToggle(webgl: WebGLController | null) {
  const root = document.querySelector('[data-quality-toggle]');
  if (!root) return;

  if (!webgl) {
    root.setAttribute('aria-hidden', 'true');
    (root as HTMLElement).style.display = 'none';
    return;
  }

  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('button[data-quality]'));
  const saved = (localStorage.getItem(STORAGE_KEY) as QualityLevel | null) || 'auto';

  setActive(saved);
  webgl.setQuality(saved);

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const level = (button.dataset.quality || 'auto') as QualityLevel;
      setActive(level);
      webgl.setQuality(level);
      localStorage.setItem(STORAGE_KEY, level);
    });
  });

  function setActive(level: QualityLevel) {
    buttons.forEach(btn => {
      const isActive = btn.dataset.quality === level;
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }
}
