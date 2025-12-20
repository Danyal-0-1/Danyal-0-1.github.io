import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { WebGLController } from './renderer';

gsap.registerPlugin(ScrollTrigger);

type ScrollInit = {
  webgl: WebGLController;
  sections: {
    hero: HTMLElement | null;
    projects: HTMLElement | null;
    about: HTMLElement | null;
    timeline: HTMLElement | null;
  };
};

export function initScrollChapters({ webgl, sections }: ScrollInit) {
  const { hero, projects, about, timeline } = sections;
  if (!hero || !projects || !about || !timeline) return;

  const state = { latent: 1, simulation: 0.2, graph: 0 };
  webgl.setChapterOpacity(state);

  gsap.to(state, {
    latent: 0.2,
    simulation: 1,
    scrollTrigger: {
      trigger: projects,
      start: 'top 80%',
      end: 'top 30%',
      scrub: true
    },
    onUpdate: () => webgl.setChapterOpacity(state)
  });

  gsap.to(state, {
    simulation: 0.3,
    graph: 1,
    scrollTrigger: {
      trigger: about,
      start: 'top 80%',
      end: 'top 30%',
      scrub: true
    },
    onUpdate: () => webgl.setChapterOpacity(state)
  });

  gsap.to(state, {
    latent: 0.1,
    graph: 1,
    scrollTrigger: {
      trigger: timeline,
      start: 'top 85%',
      end: 'top 30%',
      scrub: true
    },
    onUpdate: () => webgl.setChapterOpacity(state)
  });
}
