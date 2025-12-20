import * as THREE from 'three';
import type { QualityLevel } from '../../types';

type SimulationConfig = {
  reducedMotion: boolean;
  isMobile: boolean;
};

export function createSimulationSpace({ reducedMotion, isMobile }: SimulationConfig) {
  const group = new THREE.Group();

  const grid = new THREE.GridHelper(6, isMobile ? 10 : 18, 0xd9e3ff, 0xe6e8ee);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.3;
  grid.position.y = -1;
  group.add(grid);

  const rayGroup = new THREE.Group();
  const rayCount = isMobile ? 3 : 6;

  for (let i = 0; i < rayCount; i++) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-2, -0.5, i * 0.6 - 2),
      new THREE.Vector3(2, -0.5, i * 0.6 - 2)
    ]);
    const material = new THREE.LineBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.25 });
    const line = new THREE.Line(geometry, material);
    rayGroup.add(line);
  }

  group.add(rayGroup);

  let pulseStrength = 0;

  function update(delta: number, elapsed: number) {
    if (!reducedMotion) {
      rayGroup.children.forEach((line, index) => {
        line.position.z = Math.sin(elapsed * 0.6 + index) * 0.6;
      });
    }

    if (pulseStrength > 0.001) {
      pulseStrength *= 0.92;
      rayGroup.children.forEach(line => {
        const mat = line.material as THREE.LineBasicMaterial;
        mat.opacity = 0.2 + pulseStrength * 0.4;
      });
    }
  }

  function pulse() {
    pulseStrength = 1;
  }

  function setOpacity(value: number) {
    group.visible = value > 0.02;
    rayGroup.children.forEach(line => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = value * 0.25;
    });
    (grid.material as THREE.Material).opacity = value * 0.25;
  }

  function setQuality(level: QualityLevel) {
    const scale = level === 'low' ? 0.6 : level === 'high' ? 1 : 0.8;
    rayGroup.children.forEach(line => {
      const mat = line.material as THREE.LineBasicMaterial;
      mat.opacity = 0.18 * scale;
    });
    (grid.material as THREE.Material).opacity = 0.25 * scale;
  }

  return { group, update, pulse, setOpacity, setQuality };
}
