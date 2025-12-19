// Three.js scene factory with sensible defaults and comments for newcomers.
// Each call returns a renderer + scene + camera bound to a specific canvas.
// We keep a tiny update registry so other modules (robot, particles, viz) can hook into the render loop.

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js';

export function createScene({ canvas, enableOrbit = false, background = null }) {
  if (!canvas) throw new Error('canvas is required for createScene');

  // Renderer: antialias for smooth edges; alpha lets us overlay on the page.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8)); // cap DPR for perf

  const scene = new THREE.Scene();
  if (background) {
    scene.background = new THREE.Color(background);
  }

  // Camera: 50° FOV, slightly above the origin looking forward.
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.35, 3.2);

  // Soft ambient + directional light combo; works for untextured low-poly meshes.
  const hemi = new THREE.HemisphereLight(0xa6c9ff, 0x0b1224, 0.9);
  const dir = new THREE.DirectionalLight(0xffffff, 0.75);
  dir.position.set(3, 4, 2);
  dir.castShadow = false;
  scene.add(hemi, dir);

  const clock = new THREE.Clock();
  const updateFns = new Set();

  // Optional orbit controls (used for the data viz section, disabled in hero).
  let controls = null;
  if (enableOrbit) {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 8;
  }

  function addUpdate(fn) {
    updateFns.add(fn);
    return () => updateFns.delete(fn);
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', resize);
  resize();

  function renderLoop() {
    const delta = clock.getDelta();
    const elapsed = clock.elapsedTime;
    updateFns.forEach(fn => fn(delta, elapsed));
    if (controls) controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(renderLoop);

  return { scene, camera, renderer, controls, clock, addUpdate, resize };
}

export function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}
