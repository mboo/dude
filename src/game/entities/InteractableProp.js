import * as THREE from 'three';

export class InteractableProp {
  constructor(mesh, label, onInteract) {
    this.mesh = mesh;
    this.position = mesh.position;
    this.label = label;
    this.radius = 2.8;
    this.cooldown = 0;
    this.onInteract = onInteract;
  }

  static createLantern() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.45, 18),
      new THREE.MeshStandardMaterial({ color: '#6f695f', metalness: 0.4, roughness: 0.6 })
    );
    body.castShadow = true;
    group.add(body);

    const glow = new THREE.PointLight('#ffbf73', 1.5, 10, 2);
    glow.position.y = 0.15;
    group.add(glow);

    return { group, glow };
  }
}
