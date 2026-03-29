import * as THREE from 'three';
import { InputManager } from './systems/InputManager.js';
import { ThirdPersonCamera } from './systems/ThirdPersonCamera.js';
import { PlayerStateMachine } from './systems/PlayerStateMachine.js';
import { InteractionSystem } from './systems/InteractionSystem.js';
import { CombatSystem } from './systems/CombatSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { createTestLevel } from './world/createTestLevel.js';
import { Player } from './entities/Player.js';
import { Hud } from './ui/Hud.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.clock = new THREE.Clock();

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#8fa3ad');
    this.scene.fog = new THREE.Fog('#8fa3ad', 40, 120);

    this.camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 300);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.shell = document.createElement('div');
    this.shell.className = 'game-shell';

    this.canvas = this.renderer.domElement;
    this.canvas.className = 'game-canvas';

    this.input = new InputManager(this.canvas);
    this.stateMachine = new PlayerStateMachine();
    this.hud = new Hud();

    this.collisionSystem = new CollisionSystem();
    this.player = new Player(this.scene, this.stateMachine, this.collisionSystem);
    this.cameraController = new ThirdPersonCamera(this.camera, this.player, this.input);
    this.interactionSystem = new InteractionSystem(this.player);
    this.combatSystem = new CombatSystem(this.scene, this.camera, this.player);

    this.updatables = [];
    this.handleResize = this.onResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  start() {
    this.root.append(this.shell);
    this.shell.append(this.canvas, this.hud.element);

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onResize();

    createTestLevel(this.scene, this.interactionSystem, this.combatSystem, this.collisionSystem);

    // The camera updates before the player so movement uses the latest orbit yaw.
    this.updatables.push(this.cameraController, this.player, this.combatSystem, this.interactionSystem);

    window.addEventListener('resize', this.handleResize);
    this.renderer.setAnimationLoop(this.animate);
  }

  onResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    const delta = Math.min(this.clock.getDelta(), 0.05);

    this.player.beforeUpdate(this.input);

    for (const system of this.updatables) {
      system.update(delta, this.input);
    }

    this.hud.update({
      state: this.stateMachine.currentState,
      interactionText: this.interactionSystem.promptText,
      pointerLocked: this.input.isPointerLocked,
      aiming: this.player.isAiming
    });

    this.renderer.render(this.scene, this.camera);
    this.input.endFrame();
  }
}
