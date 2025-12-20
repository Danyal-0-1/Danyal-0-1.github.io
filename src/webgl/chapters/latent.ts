import * as THREE from 'three';
import type { QualityLevel } from '../../types';

type LatentConfig = {
  reducedMotion: boolean;
  isMobile: boolean;
};

export function createLatentField({ reducedMotion, isMobile }: LatentConfig) {
  const group = new THREE.Group();
  const count = isMobile ? 520 : 1100;
  const area = 6;

  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * area;
    positions[i3 + 1] = (Math.random() - 0.5) * area * 0.5;
    positions[i3 + 2] = (Math.random() - 0.5) * area;
    velocities[i3] = (Math.random() - 0.5) * 0.004;
    velocities[i3 + 1] = (Math.random() - 0.5) * 0.004;
    velocities[i3 + 2] = (Math.random() - 0.5) * 0.004;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x8fb3ff,
    size: 0.03,
    transparent: true,
    opacity: 0.35,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  group.add(points);

  function update(delta: number) {
    if (reducedMotion) return;
    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      pos.array[i3] += velocities[i3] * delta * 60;
      pos.array[i3 + 1] += velocities[i3 + 1] * delta * 60;
      pos.array[i3 + 2] += velocities[i3 + 2] * delta * 60;

      if (pos.array[i3] > area) pos.array[i3] = -area;
      if (pos.array[i3] < -area) pos.array[i3] = area;
      if (pos.array[i3 + 1] > area * 0.5) pos.array[i3 + 1] = -area * 0.5;
      if (pos.array[i3 + 1] < -area * 0.5) pos.array[i3 + 1] = area * 0.5;
      if (pos.array[i3 + 2] > area) pos.array[i3 + 2] = -area;
      if (pos.array[i3 + 2] < -area) pos.array[i3 + 2] = area;
    }
    pos.needsUpdate = true;
    points.rotation.y += delta * 0.03;
  }

  function setOpacity(value: number) {
    material.opacity = value * 0.35;
    group.visible = value > 0.02;
  }

  function setQuality(level: QualityLevel) {
    if (level === 'low') {
      material.size = 0.02;
      material.opacity = 0.18;
    } else if (level === 'high') {
      material.size = 0.035;
      material.opacity = 0.4;
    } else {
      material.size = 0.03;
      material.opacity = 0.3;
    }
  }

  return { group, update, setOpacity, setQuality };
}
