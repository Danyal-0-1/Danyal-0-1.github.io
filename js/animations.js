import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';

export function initAnimations() {
  if (!gsap) return;
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  gsap.from(['.hero h1', '.hero .lede', '.hero .chips'], {
    y: 20,
    opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.12
  });

  // Section reveals on scroll
  document.querySelectorAll('.section').forEach(section => {
    gsap.from(section.querySelectorAll('h2, .lede, .panel, .projectCard, .contactCard, .form'), {
      scrollTrigger: {
        trigger: section,
        start: 'top 80%'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.08
    });
  });
}

export function animateSkillCloud() {
  const cloud = document.getElementById('skillCloud');
  if (!cloud) return;
  gsap.to(cloud.children, {
    rotateY: 12,
    rotateX: -10,
    yoyo: true,
    repeat: -1,
    duration: 6,
    ease: 'sine.inOut',
    stagger: {
      each: 0.18,
      from: 'random'
    }
  });
}
