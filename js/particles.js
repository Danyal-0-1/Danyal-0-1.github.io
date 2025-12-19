import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

// Background particle field using Points. Uses instancing-friendly BufferGeometry for performance.
export function createParticleField(scene, { count = 800, area = 6 } = {}) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * area;
    positions[i3 + 1] = Math.random() * 2.6 + 0.1;
    positions[i3 + 2] = (Math.random() - 0.5) * area;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x74c0ff,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  function update(delta, elapsed) {
    points.rotation.y = elapsed * 0.06;
    points.material.opacity = 0.6 + Math.sin(elapsed * 0.8) * 0.1;
  }

  return { object: points, update };
}

// Abstract lattice for the interactive experience section.
export function createNetworkLattice(scene, { nodes = 18 } = {}) {
  const group = new THREE.Group();

  const nodeGeo = new THREE.SphereGeometry(0.08, 12, 12);
  const nodeMat = new THREE.MeshStandardMaterial({ color: 0x5fb0ff, emissive: 0x1e3a8a, emissiveIntensity: 0.6, metalness: 0.35, roughness: 0.25 });

  const nodeMeshes = [];
  for (let i = 0; i < nodes; i++) {
    const m = new THREE.Mesh(nodeGeo, nodeMat.clone());
    m.position.set(Math.random() * 2 - 1, Math.random() * 1.4, Math.random() * 2 - 1);
    group.add(m);
    nodeMeshes.push(m);
  }

  // Connect nodes with lines to imply edges / fusion pathways.
  const lineMat = new THREE.LineBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5 });
  const connections = new THREE.Group();
  nodeMeshes.forEach((a, idx) => {
    const b = nodeMeshes[(idx + 3) % nodeMeshes.length];
    const geometry = new THREE.BufferGeometry().setFromPoints([a.position, b.position]);
    const line = new THREE.Line(geometry, lineMat);
    connections.add(line);
  });
  group.add(connections);

  scene.add(group);

  function update(delta, elapsed) {
    group.rotation.y += delta * 0.12;
    connections.children.forEach((line, i) => {
      line.material.opacity = 0.35 + Math.sin(elapsed * 1.6 + i) * 0.15;
    });
    nodeMeshes.forEach((m, i) => {
      m.position.y += Math.sin(elapsed * 1.4 + i) * 0.0025;
    });
  }

  function reset() {
    group.rotation.set(0, 0, 0);
  }

  return { object: group, update, reset };
}
