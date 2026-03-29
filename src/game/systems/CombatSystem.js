import * as THREE from 'three';

export class CombatSystem {
  constructor(scene, camera, player) {
    this.scene = scene;
    this.camera = camera;
    this.player = player;
    this.raycaster = new THREE.Raycaster();
    this.shootables = [];
    this.flashTime = 0;
    this.shotCooldown = 0;
    this.traceLife = 0;
    this.traceDuration = 0.18;
    this.traceStart = new THREE.Vector3();
    this.traceEnd = new THREE.Vector3();
    this.traceDirection = new THREE.Vector3();
    this.traceMidpoint = new THREE.Vector3();
    this.traceQuaternion = new THREE.Quaternion();
    this.traceScale = new THREE.Vector3(1, 1, 1);
    this.upAxis = new THREE.Vector3(0, 1, 0);

    this.muzzleFlash = new THREE.PointLight('#ffbd75', 0, 6, 2);
    this.scene.add(this.muzzleFlash);

    this.tracer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1, 8),
      new THREE.MeshBasicMaterial({ color: '#ffd8a3', transparent: true, opacity: 0 })
    );
    this.tracer.visible = false;
    this.scene.add(this.tracer);

    this.bulletMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 12, 12),
      new THREE.MeshBasicMaterial({ color: '#fff3c6', transparent: true, opacity: 0 })
    );
    this.bulletMarker.visible = false;
    this.scene.add(this.bulletMarker);

    this.lastImpact = new THREE.Vector3();
    this.impactMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 10),
      new THREE.MeshBasicMaterial({ color: '#ffd29a', transparent: true, opacity: 0 })
    );
    this.scene.add(this.impactMarker);
  }

  registerShootable(object) {
    this.shootables.push(object);
  }

  update(delta) {
    this.flashTime = Math.max(0, this.flashTime - delta);
    this.shotCooldown = Math.max(0, this.shotCooldown - delta);
    this.traceLife = Math.max(0, this.traceLife - delta);

    this.muzzleFlash.intensity = this.flashTime > 0 ? 3.5 : 0;
    this.tracer.visible = this.traceLife > 0;
    this.bulletMarker.visible = this.traceLife > 0;
    this.impactMarker.visible = this.traceLife > 0;

    if (this.traceLife > 0) {
      const progress = 1 - this.traceLife / this.traceDuration;
      const opacity = 1 - progress;
      this.tracer.material.opacity = 0.9 * opacity;
      this.bulletMarker.material.opacity = opacity;
      this.impactMarker.material.opacity = 0.95 * opacity;
      this.bulletMarker.position.lerpVectors(this.traceStart, this.traceEnd, progress);
      this.bulletMarker.scale.setScalar(1 + (1 - opacity) * 0.8);
      this.impactMarker.scale.setScalar(1 + progress * 0.5);
    } else {
      this.tracer.material.opacity = 0;
      this.bulletMarker.material.opacity = 0;
      this.impactMarker.material.opacity = 0;
    }

    const muzzle = this.player.getMuzzleWorldPosition();
    this.muzzleFlash.position.copy(muzzle);

    if (this.player.consumeShotRequest() && this.shotCooldown <= 0) {
      this.fireShot(muzzle);
      this.shotCooldown = 0.14;
      this.flashTime = 0.06;
    }
  }

  fireShot(origin) {
    const direction = this.player.getAimDirection(this.camera);
    this.raycaster.set(origin, direction);

    const hits = this.raycaster.intersectObjects(this.shootables, false);
    const endPoint = hits.length > 0
      ? hits[0].point
      : origin.clone().add(direction.multiplyScalar(60));

    if (hits.length > 0) {
      const hit = hits[0].object;
      hit.userData.shotHits = (hit.userData.shotHits || 0) + 1;

      if (typeof hit.userData.onShot === 'function') {
        hit.userData.onShot(hit);
      }
    }

    this.traceStart.copy(origin);
    this.traceEnd.copy(endPoint);
    this.traceDirection.subVectors(endPoint, origin);
    const distance = this.traceDirection.length();

    if (distance > 0.0001) {
      this.traceDirection.normalize();
      this.traceMidpoint.addVectors(origin, endPoint).multiplyScalar(0.5);
      this.traceQuaternion.setFromUnitVectors(this.upAxis, this.traceDirection);
      this.tracer.position.copy(this.traceMidpoint);
      this.tracer.quaternion.copy(this.traceQuaternion);
      this.traceScale.set(1, distance, 1);
      this.tracer.scale.copy(this.traceScale);
    }

    this.traceLife = this.traceDuration;
    this.lastImpact.copy(endPoint);
    this.impactMarker.position.copy(this.lastImpact);
    this.bulletMarker.position.copy(origin);
  }
}
