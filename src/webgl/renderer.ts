import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { QualityLevel } from '../types';
import { createLatentField } from './chapters/latent';
import { createSimulationSpace } from './chapters/simulation';
import { createGraphSpace } from './chapters/graph';

export type WebGLController = {
  setQuality: (level: QualityLevel) => void;
  triggerPulse: () => void;
  enableOrbit: (enabled: boolean) => void;
  bindOrbitZone: (zone: Element | null, statusEl: Element | null) => void;
  setChapterOpacity: (state: { latent: number; simulation: number; graph: number }) => void;
};

type WebGLInit = {
  canvas: HTMLCanvasElement | null;
  reducedMotion: boolean;
};

export function initWebGL({ canvas, reducedMotion }: WebGLInit): WebGLController | null {
  if (!canvas) return null;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (error) {
    document.body.classList.add('webgl-fallback');
    return null;
  }
  renderer.setClearColor(0xffffff, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.8, 4.2);

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  const directional = new THREE.DirectionalLight(0xffffff, 0.6);
  directional.position.set(2, 3, 4);
  scene.add(ambient, directional);

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const latent = createLatentField({ reducedMotion, isMobile });
  const simulation = createSimulationSpace({ reducedMotion, isMobile });
  const graph = createGraphSpace({ reducedMotion, isMobile });

  scene.add(latent.group, simulation.group, graph.group);
  latent.setOpacity(1);
  simulation.setOpacity(0.2);
  graph.setOpacity(0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 2;
  controls.maxDistance = 6;

  let composer: EffectComposer | null = null;
  let bloomPass: UnrealBloomPass | null = null;
  let filmPass: FilmPass | null = null;

  const clock = new THREE.Clock();
  let quality: QualityLevel = 'auto';
  let autoQuality = true;
  let avgFrame = 0;

  function initComposer() {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(size, 0.25, 0.6, 0.9);
    filmPass = new FilmPass(0.08, 0.025, 648, false);
    composer.addPass(bloomPass);
    composer.addPass(filmPass);
  }

  initComposer();
  if (reducedMotion) {
    composer = null;
  }
  setQuality('auto');
  resize();
  renderer.setAnimationLoop(loop);

  window.addEventListener('resize', resize);

  function loop() {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;

    if (!reducedMotion) {
      latent.update(delta, elapsed);
      simulation.update(delta, elapsed);
      graph.update(delta, elapsed);
    }

    if (controls.enabled) controls.update();

    if (autoQuality && !reducedMotion) {
      avgFrame = avgFrame * 0.9 + delta * 0.1;
      if (avgFrame > 0.035) {
        renderer.setPixelRatio(1);
      } else if (avgFrame < 0.02) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
      }
    }

    if (composer && !reducedMotion) {
      composer.render();
    } else {
      renderer.render(scene, camera);
    }
  }

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (!clientWidth || !clientHeight) return;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    composer?.setSize(clientWidth, clientHeight);
  }

  function setQuality(level: QualityLevel) {
    quality = level;
    autoQuality = level === 'auto';

    if (level === 'low') {
      renderer.setPixelRatio(1);
      composer = null;
    } else {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, level === 'high' ? 2 : 1.5));
      if (!composer && !reducedMotion) {
        initComposer();
      }
    }

    latent.setQuality(level);
    simulation.setQuality(level);
    graph.setQuality(level);

    if (bloomPass) {
      bloomPass.strength = level === 'high' ? 0.32 : 0.18;
    }
    if (filmPass) {
      filmPass.uniforms.nIntensity.value = level === 'low' ? 0.0 : 0.06;
    }
  }

  function triggerPulse() {
    simulation.pulse();
  }

  function enableOrbit(enabled: boolean) {
    controls.enabled = enabled;
    canvas.style.pointerEvents = enabled ? 'auto' : 'none';
    if (canvas.parentElement) {
      canvas.parentElement.style.pointerEvents = enabled ? 'auto' : 'none';
    }
  }

  function bindOrbitZone(zone: Element | null, statusEl: Element | null) {
    if (!zone || !statusEl) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            enableOrbit(true);
            statusEl.textContent = 'Orbit controls: on';
          } else {
            enableOrbit(false);
            statusEl.textContent = 'Orbit controls: off';
          }
        });
      },
      { threshold: 0.6 }
    );

    observer.observe(zone);
  }

  function setChapterOpacity(state: { latent: number; simulation: number; graph: number }) {
    latent.setOpacity(state.latent);
    simulation.setOpacity(state.simulation);
    graph.setOpacity(state.graph);
  }

  return {
    setQuality,
    triggerPulse,
    enableOrbit,
    bindOrbitZone,
    setChapterOpacity
  };
}
