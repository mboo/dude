import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.colliders = [];
    this.tempOffset = new THREE.Vector2();
  }

  registerCylinder(position, radius, topY) {
    this.colliders.push({ position, radius, topY });
  }

  resolvePlayer(position, playerRadius, stepHeight, snapDistance, velocityY) {
    let groundHeight = null;

    for (const collider of this.colliders) {
      this.tempOffset.set(
        position.x - collider.position.x,
        position.z - collider.position.z
      );

      let distance = this.tempOffset.length();
      const minDistance = playerRadius + collider.radius;

      if (distance >= minDistance) {
        continue;
      }

      const topY = collider.topY;
      const canStandOnTop =
        velocityY <= 2 &&
        position.y >= topY - snapDistance &&
        position.y <= topY + stepHeight;

      if (canStandOnTop) {
        groundHeight = groundHeight === null ? topY : Math.max(groundHeight, topY);
        continue;
      }

      if (position.y >= topY + stepHeight) {
        continue;
      }

      if (distance < 0.0001) {
        this.tempOffset.set(1, 0);
        distance = 1;
      }

      this.tempOffset.multiplyScalar((minDistance - distance) / distance);
      position.x += this.tempOffset.x;
      position.z += this.tempOffset.y;
    }

    return groundHeight;
  }
}
