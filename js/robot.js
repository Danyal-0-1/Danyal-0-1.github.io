// 3D robot/avatar helper. Attempts to load a GLTF model from /assets/models/robot.glb.
// If not present, we fall back to a stylized low-poly robot built from primitives.
// The robot reacts to pointer movement (look-at) and scroll (subtle wave).

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/GLTFLoader.js';

export async function createRobot(scene) {
  let root = new THREE.Group();
  root.position.set(0, 0.2, 0);
  let mixer = null;

  const gltf = await tryLoadGLTF();
  if (gltf) {
    root.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations && gltf.animations.length) {
      mixer.clipAction(gltf.animations[0]).play();
    }
  } else {
    root = buildPrimitiveRobot();
  }

  scene.add(root);
  const targetRot = new THREE.Euler();
  let waveTimer = 0;

  function update(delta, elapsed, opts = {}) {
    const pointer = opts.pointer || { x: 0, y: 0 };
    const scroll = opts.scroll || 0;

    if (mixer) mixer.update(delta);

    // Idle float + gentle breathing.
    root.position.y = 0.3 + Math.sin(elapsed * 1.5) * 0.06;
    root.rotation.y += (pointer.x * 0.4 - root.rotation.y) * 0.08;

    // Wave arm when scroll crosses sections.
    waveTimer += (scroll > 0.25 && scroll < 0.75) ? delta : -delta * 0.5;
    waveTimer = THREE.MathUtils.clamp(waveTimer, 0, 1);
    if (root.userData.rightArm) {
      const arm = root.userData.rightArm;
      arm.rotation.z = -Math.sin(elapsed * 6) * 0.35 * waveTimer;
    }

    // Head looks toward the pointer.
    if (root.userData.head) {
      targetRot.set(pointer.y * 0.3, pointer.x * 0.5, 0);
      root.userData.head.rotation.x += (targetRot.x - root.userData.head.rotation.x) * 0.12;
      root.userData.head.rotation.y += (targetRot.y - root.userData.head.rotation.y) * 0.12;
    }
  }

  return { object: root, update };
}

async function tryLoadGLTF() {
  const url = '/assets/models/robot.glb';
  try {
    const loader = new GLTFLoader();
    return await loader.loadAsync(url);
  } catch (e) {
    // If the model is missing, quietly fall back to primitives.
    return null;
  }
}

function buildPrimitiveRobot() {
  const root = new THREE.Group();

  const palette = {
    primary: new THREE.Color(0x5fb0ff),
    secondary: new THREE.Color(0x4f46e5),
    accents: new THREE.Color(0x0ea5e9)
  };

  const bodyMat = new THREE.MeshStandardMaterial({ color: palette.primary, roughness: 0.35, metalness: 0.25, emissive: 0x0c1b34, emissiveIntensity: 0.3 });
  const accentMat = new THREE.MeshStandardMaterial({ color: palette.secondary, roughness: 0.25, metalness: 0.45, emissive: 0x121638, emissiveIntensity: 0.4 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 1.1, 8), bodyMat);
  torso.position.y = 0.65;
  torso.castShadow = torso.receiveShadow = true;
  root.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 16), accentMat);
  head.position.y = 1.35;
  head.castShadow = head.receiveShadow = true;
  root.add(head);

  // Eyes as glowing planes.
  const eyeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.02);
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: palette.accents, emissiveIntensity: 0.8 });
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.11, 1.36, 0.28);
  const eyeR = eyeL.clone();
  eyeR.position.x *= -1;
  root.add(eyeL, eyeR);

  // Antenna
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 10), accentMat);
  antenna.position.set(0, 1.65, 0);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffc857, emissive: 0xffc857, emissiveIntensity: 0.8 }));
  tip.position.y = 0.2;
  antenna.add(tip);
  root.add(antenna);

  // Arms
  const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 10);
  const armL = new THREE.Mesh(armGeo, bodyMat);
  armL.position.set(-0.6, 0.75, 0);
  armL.rotation.z = Math.PI / 6;
  const armR = armL.clone();
  armR.position.x *= -1;
  armR.rotation.z *= -1;
  root.add(armL, armR);

  // Subtle shoulder pads
  const shoulderGeo = new THREE.BoxGeometry(0.24, 0.14, 0.24);
  const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x243b67, metalness: 0.4, roughness: 0.35 });
  const shoulderL = new THREE.Mesh(shoulderGeo, shoulderMat);
  shoulderL.position.set(-0.55, 1.0, 0);
  const shoulderR = shoulderL.clone();
  shoulderR.position.x *= -1;
  root.add(shoulderL, shoulderR);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 10);
  const legL = new THREE.Mesh(legGeo, bodyMat);
  legL.position.set(-0.22, 0.0, 0);
  const legR = legL.clone();
  legR.position.x *= -1;
  root.add(legL, legR);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.8, 0.2, 10), new THREE.MeshStandardMaterial({ color: 0x0b172e, roughness: 0.8, metalness: 0.05 }));
  base.position.y = -0.2;
  base.receiveShadow = true;
  root.add(base);

  root.userData.head = head;
  root.userData.rightArm = armR;
  return root;
}
