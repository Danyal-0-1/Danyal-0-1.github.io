import * as THREE from 'three';
import type { QualityLevel } from '../../types';

type GraphConfig = {
  reducedMotion: boolean;
  isMobile: boolean;
};

export function createGraphSpace({ reducedMotion, isMobile }: GraphConfig) {
  const group = new THREE.Group();
  const nodeCount = isMobile ? 10 : 16;
  const nodeGeo = new THREE.SphereGeometry(0.06, 12, 12);
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x5b83ff, transparent: true, opacity: 0.6 });

  const nodes: THREE.Mesh[] = [];
  const basePositions: THREE.Vector3[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat.clone());
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 3
    );
    node.position.copy(pos);
    basePositions.push(pos.clone());
    nodes.push(node);
    group.add(node);
  }

  const lineGeometry = new THREE.BufferGeometry();
  const edgeCount = nodeCount + 6;
  const positions = new Float32Array(edgeCount * 2 * 3);
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.2 });
  const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
  group.add(lines);

  updateEdges();

  function update(delta: number, elapsed: number) {
    if (reducedMotion) return;

    nodes.forEach((node, index) => {
      const base = basePositions[index];
      node.position.x = base.x + Math.sin(elapsed * 0.6 + index) * 0.08;
      node.position.y = base.y + Math.cos(elapsed * 0.5 + index) * 0.06;
    });

    if (Math.floor(elapsed * 2) % 4 === 0) {
      updateEdges();
    }
    group.rotation.y += delta * 0.08;
  }

  function updateEdges() {
    const arr = lineGeometry.attributes.position.array as Float32Array;
    for (let i = 0; i < edgeCount; i++) {
      const a = nodes[i % nodes.length];
      const b = nodes[(i + 3) % nodes.length];
      const baseIndex = i * 6;
      arr[baseIndex] = a.position.x;
      arr[baseIndex + 1] = a.position.y;
      arr[baseIndex + 2] = a.position.z;
      arr[baseIndex + 3] = b.position.x;
      arr[baseIndex + 4] = b.position.y;
      arr[baseIndex + 5] = b.position.z;
    }
    lineGeometry.attributes.position.needsUpdate = true;
  }

  function setOpacity(value: number) {
    group.visible = value > 0.02;
    nodes.forEach(node => {
      const mat = node.material as THREE.MeshBasicMaterial;
      mat.opacity = value * 0.6;
    });
    lineMaterial.opacity = value * 0.25;
  }

  function setQuality(level: QualityLevel) {
    if (level === 'low') {
      lineMaterial.opacity = 0.12;
    } else if (level === 'high') {
      lineMaterial.opacity = 0.28;
    } else {
      lineMaterial.opacity = 0.2;
    }
  }

  return { group, update, setOpacity, setQuality };
}
