import * as THREE from 'three';
import { buildDrifterModel } from './buildDrifterModel.js';
import { damp } from '../core/math.js';

export class Player {
  constructor(scene, stateMachine, collisionSystem) {
    this.scene = scene;
    this.stateMachine = stateMachine;
    this.collisionSystem = collisionSystem;

    this.group = new THREE.Group();
    this.group.position.set(0, 0, 0);
    scene.add(this.group);

    const { root, rig } = buildDrifterModel();
    this.visualRoot = root;
    this.rig = rig;
    this.group.add(this.visualRoot);

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();
    this.cameraForward = new THREE.Vector3(0, 0, 1);
    this.cameraRight = new THREE.Vector3(1, 0, 0);
    this.cameraFocus = new THREE.Vector3();

    this.walkSpeed = 4.5;
    this.runSpeed = 8;
    this.crouchSpeed = 2.2;
    this.jumpStrength = 8.5;
    this.gravity = 22;
    this.rotationSpeed = 12;
    this.turnTarget = 0;
    this.isGrounded = true;
    this.jumpQueued = false;
    this.animationTime = 0;
    this.idleTime = 0;
    this.isAiming = false;
    this.fireRequested = false;
    this.firePulse = 0;
    this.muzzleWorldPosition = new THREE.Vector3();
    this.aimDirection = new THREE.Vector3();
    this.collisionRadius = 0.55;
    this.stepHeight = 0.7;
    this.groundSnapDistance = 0.35;
  }

  beforeUpdate(input) {
    this.actions = input.getActionSnapshot();
  }

  update(delta) {
    const actions = this.actions;
    const moveMagnitude = Math.hypot(actions.moveX, actions.moveY);
    const hasMoveInput = moveMagnitude > 0;
    const crouching = actions.crouch && this.isGrounded;
    this.isAiming = actions.rightDown;
    const sprinting = actions.sprint && hasMoveInput && !crouching && !this.isAiming;
    const targetSpeed = crouching ? this.crouchSpeed : sprinting ? this.runSpeed : this.walkSpeed;
    this.firePulse = Math.max(0, this.firePulse - delta * 4);

    if (actions.leftClick && this.isAiming) {
      this.fireRequested = true;
      this.firePulse = 1;
    }

    if (hasMoveInput) {
      this.cameraForward.set(Math.sin(this.turnTarget), 0, Math.cos(this.turnTarget));
      this.cameraRight.set(this.cameraForward.z, 0, -this.cameraForward.x);

      this.direction
        .copy(this.cameraRight)
        .multiplyScalar(actions.moveX)
        .addScaledVector(this.cameraForward, actions.moveY)
        .normalize();

      this.velocity.x = damp(this.velocity.x, this.direction.x * targetSpeed, 14, delta);
      this.velocity.z = damp(this.velocity.z, this.direction.z * targetSpeed, 14, delta);

      const facingAngle = this.isAiming
        ? this.turnTarget + Math.PI
        : Math.atan2(this.direction.x, this.direction.z);
      this.group.rotation.y = damp(this.group.rotation.y, facingAngle, this.rotationSpeed, delta);
    } else {
      this.velocity.x = damp(this.velocity.x, 0, 12, delta);
      this.velocity.z = damp(this.velocity.z, 0, 12, delta);

      if (this.isAiming) {
        this.group.rotation.y = damp(this.group.rotation.y, this.turnTarget + Math.PI, this.rotationSpeed, delta);
      }
    }

    if (actions.jump && this.isGrounded && !crouching && !this.jumpQueued) {
      this.velocity.y = this.jumpStrength;
      this.isGrounded = false;
      this.jumpQueued = true;
    }

    if (!actions.jump) {
      this.jumpQueued = false;
    }

    if (!this.isGrounded) {
      this.velocity.y -= this.gravity * delta;
    }

    this.group.position.addScaledVector(this.velocity, delta);
    const surfaceHeight = this.collisionSystem.resolvePlayer(
      this.group.position,
      this.collisionRadius,
      this.stepHeight,
      this.groundSnapDistance,
      this.velocity.y
    );

    const groundHeight = Math.max(0, surfaceHeight ?? 0);
    const canLandOnSurface = this.velocity.y <= 0 && this.group.position.y <= groundHeight + this.stepHeight;

    if (canLandOnSurface) {
      this.group.position.y = groundHeight;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else if (this.group.position.y <= 0) {
      this.group.position.y = 0;
      this.velocity.y = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }

    this.updateState(hasMoveInput, sprinting, crouching);
    this.updateVisuals(delta, moveMagnitude, sprinting, crouching);
  }

  updateVisuals(delta, moveMagnitude, sprinting, crouching) {
    const state = this.stateMachine.currentState;
    const speedFactor = crouching ? 0.55 : sprinting ? 1.7 : moveMagnitude > 0 ? 1 : 0.38;

    this.animationTime += delta * 7.5 * speedFactor;
    this.idleTime += delta;

    const stride = Math.sin(this.animationTime);
    const strideOpposite = Math.sin(this.animationTime + Math.PI);
    const bounce = Math.abs(Math.sin(this.animationTime * 2));
    const idleBreath = Math.sin(this.idleTime * 1.8);
    const idleShift = Math.sin(this.idleTime * 0.9);

    const aimWeight = this.isAiming ? 1 : 0;
    const fireKick = this.firePulse * 0.18;
    const pose = {
      rootY: 0,
      hipsY: 0,
      torsoY: 1.05,
      torsoRotX: 0,
      torsoRotY: 0,
      headRotX: 0,
      headRotY: 0,
      leftArmX: -0.08,
      rightArmX: -0.08,
      leftArmZ: -0.1,
      rightArmZ: 0.1,
      leftElbowX: -0.15,
      rightElbowX: -0.15,
      leftHandX: 0,
      leftHandY: 0,
      leftHandZ: 0,
      leftLegX: 0,
      rightLegX: 0,
      leftKneeX: 0.08,
      rightKneeX: 0.08,
      leftBootX: 0,
      rightBootX: 0,
      holsterZ: -0.2,
      rightHandX: 0,
      rightHandY: 0,
      rightHandZ: 0,
      revolverY: 0,
      revolverX: 0
    };

    if (state === 'idle') {
      pose.hipsY = idleBreath * 0.03;
      pose.torsoY += idleBreath * 0.02;
      pose.torsoRotY = idleShift * 0.06;
      pose.torsoRotX = idleBreath * 0.02;
      pose.headRotY = idleShift * 0.08;
      pose.headRotX = idleBreath * -0.03;
      pose.leftArmX = -0.18 + idleBreath * 0.05;
      pose.rightArmX = -0.12 - idleBreath * 0.04;
      pose.leftElbowX = -0.18 - idleBreath * 0.04;
      pose.rightElbowX = -0.22 + idleBreath * 0.04;
      pose.leftLegX = idleShift * 0.02;
      pose.rightLegX = -idleShift * 0.02;
      pose.leftKneeX = 0.14 + idleBreath * 0.03;
      pose.rightKneeX = 0.14 + idleBreath * 0.03;
      pose.leftBootX = -0.14;
      pose.rightBootX = -0.14;
    }

    if (state === 'walk') {
      pose.hipsY = bounce * 0.05;
      pose.torsoRotY = stride * 0.08;
      pose.torsoRotX = 0.05;
      pose.headRotY = stride * 0.05;
      pose.leftArmX = strideOpposite * 0.55 - 0.1;
      pose.rightArmX = stride * 0.55 - 0.1;
      pose.leftElbowX = -0.2 - Math.max(0, stride) * 0.18;
      pose.rightElbowX = -0.2 - Math.max(0, strideOpposite) * 0.18;
      pose.leftLegX = stride * 0.7;
      pose.rightLegX = strideOpposite * 0.7;
      pose.leftKneeX = 0.18 + Math.max(0, strideOpposite) * 0.34;
      pose.rightKneeX = 0.18 + Math.max(0, stride) * 0.34;
      pose.leftBootX = -0.18 + Math.max(0, strideOpposite) * 0.12;
      pose.rightBootX = -0.18 + Math.max(0, stride) * 0.12;
      pose.holsterZ = -0.26 + stride * 0.05;
    }

    if (state === 'run') {
      pose.hipsY = bounce * 0.1;
      pose.torsoRotY = stride * 0.1;
      pose.torsoRotX = 0.2;
      pose.headRotX = -0.08;
      pose.leftArmX = strideOpposite * 0.95 - 0.45;
      pose.rightArmX = stride * 0.95 - 0.45;
      pose.leftElbowX = -0.28 - Math.max(0, stride) * 0.26;
      pose.rightElbowX = -0.28 - Math.max(0, strideOpposite) * 0.26;
      pose.leftLegX = stride * 1.05;
      pose.rightLegX = strideOpposite * 1.05;
      pose.leftKneeX = 0.22 + Math.max(0, strideOpposite) * 0.48;
      pose.rightKneeX = 0.22 + Math.max(0, stride) * 0.48;
      pose.leftBootX = -0.24 + Math.max(0, strideOpposite) * 0.16;
      pose.rightBootX = -0.24 + Math.max(0, stride) * 0.16;
      pose.holsterZ = -0.34 + stride * 0.09;
    }

    if (state === 'jump') {
      const rise = THREE.MathUtils.clamp(this.velocity.y / this.jumpStrength, -1, 1);
      pose.hipsY = 0.08;
      pose.torsoRotX = rise > 0 ? -0.08 : 0.16;
      pose.headRotX = rise > 0 ? 0.06 : -0.14;
      pose.leftArmX = -0.4 + rise * 0.18;
      pose.rightArmX = -0.25 + rise * 0.12;
      pose.leftElbowX = -0.42;
      pose.rightElbowX = -0.36;
      pose.leftLegX = 0.35 - rise * 0.45;
      pose.rightLegX = 0.2 - rise * 0.4;
      pose.leftKneeX = 0.52;
      pose.rightKneeX = 0.46;
      pose.leftBootX = -0.12;
      pose.rightBootX = -0.16;
      pose.holsterZ = -0.28;
    }

    if (state === 'crouch') {
      pose.hipsY = -0.14 + bounce * 0.02;
      pose.torsoRotX = 0.25;
      pose.headRotX = -0.1;
      pose.leftArmX = -0.45 + strideOpposite * 0.25;
      pose.rightArmX = -0.45 + stride * 0.25;
      pose.leftElbowX = -0.55;
      pose.rightElbowX = -0.55;
      pose.leftLegX = 0.55 + stride * 0.18;
      pose.rightLegX = 0.55 + strideOpposite * 0.18;
      pose.leftKneeX = 0.8;
      pose.rightKneeX = 0.8;
      pose.leftBootX = -0.42;
      pose.rightBootX = -0.42;
      pose.holsterZ = -0.12;
    }

    if (aimWeight > 0) {
      pose.torsoRotY += 0.12 * aimWeight;
      pose.torsoRotX += 0.06 * aimWeight;
      pose.headRotY += 0.08 * aimWeight;
      pose.headRotX -= 0.04 * aimWeight;
      pose.rightArmX = -1.15 - fireKick;
      pose.rightArmZ = 0.28;
      pose.leftArmX = -0.4 + Math.max(0, strideOpposite) * 0.12 - fireKick * 0.35;
      pose.leftArmZ = -0.28;
      pose.leftElbowX = -0.6;
      pose.rightElbowX = -1.18 - fireKick * 0.45;
      pose.leftHandX = -0.12;
      pose.leftHandZ = -0.1;
      pose.rightHandX = -0.35 - fireKick * 0.6;
      pose.rightHandY = 0.15;
      pose.rightHandZ = 0.16;
      pose.revolverY = 0.12;
      pose.revolverX = -0.08 - fireKick * 0.7;
    }

    this.visualRoot.position.y = damp(this.visualRoot.position.y, pose.rootY, 10, delta);
    this.rig.hips.position.y = damp(this.rig.hips.position.y, pose.hipsY, 10, delta);
    this.rig.torso.position.y = damp(this.rig.torso.position.y, pose.torsoY, 10, delta);
    this.rig.torso.rotation.x = damp(this.rig.torso.rotation.x, pose.torsoRotX, 10, delta);
    this.rig.torso.rotation.y = damp(this.rig.torso.rotation.y, pose.torsoRotY, 10, delta);
    this.rig.head.rotation.x = damp(this.rig.head.rotation.x, pose.headRotX, 10, delta);
    this.rig.head.rotation.y = damp(this.rig.head.rotation.y, pose.headRotY, 10, delta);
    this.rig.leftArm.rotation.x = damp(this.rig.leftArm.rotation.x, pose.leftArmX, 12, delta);
    this.rig.rightArm.rotation.x = damp(this.rig.rightArm.rotation.x, pose.rightArmX, 12, delta);
    this.rig.leftArm.rotation.z = damp(this.rig.leftArm.rotation.z, pose.leftArmZ, 12, delta);
    this.rig.rightArm.rotation.z = damp(this.rig.rightArm.rotation.z, pose.rightArmZ, 12, delta);
    this.rig.leftElbow.rotation.x = damp(this.rig.leftElbow.rotation.x, pose.leftElbowX, 14, delta);
    this.rig.rightElbow.rotation.x = damp(this.rig.rightElbow.rotation.x, pose.rightElbowX, 14, delta);
    this.rig.leftHand.rotation.x = damp(this.rig.leftHand.rotation.x, pose.leftHandX, 16, delta);
    this.rig.leftHand.rotation.y = damp(this.rig.leftHand.rotation.y, pose.leftHandY, 16, delta);
    this.rig.leftHand.rotation.z = damp(this.rig.leftHand.rotation.z, pose.leftHandZ, 16, delta);
    this.rig.leftLeg.rotation.x = damp(this.rig.leftLeg.rotation.x, pose.leftLegX, 12, delta);
    this.rig.rightLeg.rotation.x = damp(this.rig.rightLeg.rotation.x, pose.rightLegX, 12, delta);
    this.rig.leftKnee.rotation.x = damp(this.rig.leftKnee.rotation.x, pose.leftKneeX, 14, delta);
    this.rig.rightKnee.rotation.x = damp(this.rig.rightKnee.rotation.x, pose.rightKneeX, 14, delta);
    this.rig.leftBoot.rotation.x = damp(this.rig.leftBoot.rotation.x, pose.leftBootX, 12, delta);
    this.rig.rightBoot.rotation.x = damp(this.rig.rightBoot.rotation.x, pose.rightBootX, 12, delta);
    this.rig.holster.rotation.z = damp(this.rig.holster.rotation.z, pose.holsterZ, 12, delta);
    this.rig.rightHand.rotation.x = damp(this.rig.rightHand.rotation.x, pose.rightHandX, 16, delta);
    this.rig.rightHand.rotation.y = damp(this.rig.rightHand.rotation.y, pose.rightHandY, 16, delta);
    this.rig.rightHand.rotation.z = damp(this.rig.rightHand.rotation.z, pose.rightHandZ, 16, delta);
    this.rig.revolver.rotation.y = damp(this.rig.revolver.rotation.y, pose.revolverY, 16, delta);
    this.rig.revolver.rotation.x = damp(this.rig.revolver.rotation.x, pose.revolverX, 16, delta);
  }

  updateState(hasMoveInput, sprinting, crouching) {
    if (!this.isGrounded) {
      this.stateMachine.set('jump');
      return;
    }

    if (crouching) {
      this.stateMachine.set('crouch');
      return;
    }

    if (hasMoveInput && sprinting) {
      this.stateMachine.set('run');
      return;
    }

    if (hasMoveInput) {
      this.stateMachine.set('walk');
      return;
    }

    this.stateMachine.set('idle');
  }

  setFacingFromCameraYaw(yaw) {
    this.turnTarget = yaw;
  }

  getCameraFocus(target) {
    return target.copy(this.group.position).add(new THREE.Vector3(0, 1.6, 0));
  }

  getPosition(target) {
    return target.copy(this.group.position);
  }

  consumeShotRequest() {
    if (!this.fireRequested) {
      return false;
    }

    this.fireRequested = false;
    return true;
  }

  getMuzzleWorldPosition() {
    const muzzleLocal = new THREE.Vector3(0, 0.01, 0.4);
    return this.rig.revolver.localToWorld(this.muzzleWorldPosition.copy(muzzleLocal));
  }

  getAimDirection(camera) {
    return camera.getWorldDirection(this.aimDirection).normalize();
  }
}
