import * as THREE from 'three';
import { clamp, damp } from '../core/math.js';

export class ThirdPersonCamera {
  constructor(camera, player, input) {
    this.camera = camera;
    this.player = player;
    this.input = input;
    this.pitch = 0.35;
    this.yaw = 0;
    this.distance = 6;
    this.height = 1.8;
    this.lookTarget = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();
    this.offset = new THREE.Vector3();
    this.aimSideOffset = new THREE.Vector3();
    this.aimLookOffset = new THREE.Vector3();
  }

  update(delta) {
    const actions = this.input.getActionSnapshot();
    const keyboardLookSpeed = 1.9;

    this.yaw -= actions.lookX * 0.0025;
    this.pitch += actions.lookY * 0.0018;
    this.yaw += actions.cameraX * keyboardLookSpeed * delta;
    this.pitch += actions.cameraY * keyboardLookSpeed * delta;
    this.pitch = clamp(this.pitch, -0.15, 1.0);

    const focus = this.player.getCameraFocus(this.lookTarget);
    const aiming = this.player.isAiming;
    const distance = aiming ? 4.2 : this.distance;
    const height = aiming ? 1.35 : this.height;
    const horizontalDistance = Math.cos(this.pitch) * distance;

    this.offset.set(
      Math.sin(this.yaw) * horizontalDistance,
      Math.sin(this.pitch) * distance + height,
      Math.cos(this.yaw) * horizontalDistance
    );

    if (aiming) {
      const right = this.aimSideOffset.set(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const lookOffset = this.aimLookOffset.set(
        Math.sin(this.yaw) * -1.05,
        0.48,
        Math.cos(this.yaw) * -1.05
      );

      focus.add(lookOffset);
      this.cameraTarget.copy(focus).add(this.offset).addScaledVector(right, 2.35);
    } else {
      this.cameraTarget.copy(focus).add(this.offset);
    }

    this.camera.position.x = damp(this.camera.position.x, this.cameraTarget.x, 8, delta);
    this.camera.position.y = damp(this.camera.position.y, this.cameraTarget.y, 8, delta);
    this.camera.position.z = damp(this.camera.position.z, this.cameraTarget.z, 8, delta);
    this.camera.lookAt(focus);

    this.player.setFacingFromCameraYaw(this.yaw);
  }
}
