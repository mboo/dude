import * as THREE from 'three';

export class InteractionSystem {
  constructor(player) {
    this.player = player;
    this.interactables = [];
    this.closest = null;
    this.promptText = 'Click to lock mouse';
    this.playerPosition = new THREE.Vector3();
  }

  register(interactable) {
    this.interactables.push(interactable);
  }

  update(delta, input) {
    const actions = input.getActionSnapshot();
    const position = this.player.getPosition(this.playerPosition);
    let closest = null;
    let closestDistance = Infinity;

    for (const interactable of this.interactables) {
      const distance = interactable.position.distanceTo(position);
      if (distance < interactable.radius && distance < closestDistance) {
        closest = interactable;
        closestDistance = distance;
      }
    }

    this.closest = closest;

    if (!closest) {
      this.promptText = input.isPointerLocked ? '' : 'Click to lock mouse';
      return;
    }

    this.promptText = `E: ${closest.label}`;

    if (actions.interact && !closest.cooldown) {
      closest.onInteract();
      closest.cooldown = 0.4;
    }

    for (const interactable of this.interactables) {
      interactable.cooldown = Math.max(0, (interactable.cooldown || 0) - delta);
    }
  }
}
