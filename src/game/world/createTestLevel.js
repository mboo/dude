import * as THREE from 'three';
import { InteractableProp } from '../entities/InteractableProp.js';

export function createTestLevel(scene, interactionSystem, combatSystem, collisionSystem) {
  const ambient = new THREE.HemisphereLight('#d7d9c8', '#6f5840', 1.6);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight('#fff0d6', 2.4);
  sun.position.set(14, 22, 8);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 80;
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 35;
  sun.shadow.camera.bottom = -35;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(120, 64),
    new THREE.MeshStandardMaterial({ color: '#7a674f', roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const trail = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 8),
    new THREE.MeshStandardMaterial({ color: '#8f7a5c', roughness: 1 })
  );
  trail.rotation.x = -Math.PI / 2;
  trail.position.set(0, 0.01, 0);
  trail.receiveShadow = true;
  scene.add(trail);

  const crateMaterial = new THREE.MeshStandardMaterial({ color: '#7b5738', roughness: 0.95 });
  const rockMaterial = new THREE.MeshStandardMaterial({ color: '#6d685c', roughness: 1 });

  for (const [x, z, scale] of [
    [-8, -5, 1],
    [6, -10, 1.2],
    [12, 6, 0.8],
    [-14, 8, 1.4]
  ]) {
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.4 * scale, 1.1 * scale, 1.4 * scale), crateMaterial);
    crate.position.set(x, 0.55 * scale, z);
    crate.castShadow = true;
    crate.receiveShadow = true;
    scene.add(crate);
    combatSystem.registerShootable(crate);
    collisionSystem.registerCylinder(crate.position, 1 * scale, 1.1 * scale);
  }

  for (const [x, z, scale] of [
    [-5, 11, 1.4],
    [9, 10, 1],
    [15, -4, 1.8]
  ]) {
    const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(scale, 0), rockMaterial);
    rock.position.set(x, scale * 0.45, z);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
    combatSystem.registerShootable(rock);
    collisionSystem.registerCylinder(rock.position, 0.8 * scale, scale * 0.9);
  }

  const signPost = new THREE.Group();

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.14, 2.6, 12),
    new THREE.MeshStandardMaterial({ color: '#5b4128', roughness: 0.95 })
  );
  post.position.y = 1.3;
  post.castShadow = true;
  signPost.add(post);

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.75, 0.12),
    new THREE.MeshStandardMaterial({ color: '#7b5e38', roughness: 0.92 })
  );
  sign.position.set(0, 2.2, 0);
  sign.castShadow = true;
  signPost.add(sign);

  signPost.position.set(4, 0, 5);
  scene.add(signPost);
  collisionSystem.registerCylinder(signPost.position, 1.05, 2.6);

  interactionSystem.register({
    position: signPost.position,
    label: 'Read weathered sign',
    radius: 3,
    cooldown: 0,
    onInteract: () => {
      console.info('The old sign reads: SOUTH RANGE - NO LAW AFTER DUSK');
    }
  });

  const { group: lantern, glow } = InteractableProp.createLantern();
  lantern.position.set(-4, 1.1, 3);
  glow.intensity = 1.8;
  scene.add(lantern);
  collisionSystem.registerCylinder(lantern.position, 0.65, 1.55);

  interactionSystem.register({
    position: lantern.position,
    label: 'Lift lantern',
    radius: 2.6,
    cooldown: 0,
    onInteract: () => {
      glow.intensity = glow.intensity > 0.3 ? 0.25 : 1.8;
      console.info('You test the lantern hook for a future item interaction.');
    }
  });

  for (const [x, z] of [
    [8, 2],
    [11, 0],
    [14, -2]
  ]) {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.7, 10),
      new THREE.MeshStandardMaterial({ color: '#5f836c', roughness: 0.35, metalness: 0.05 })
    );
    bottle.position.set(x, 0.35, z);
    bottle.castShadow = true;
    bottle.userData.onShot = (mesh) => {
      mesh.rotation.z += 0.35;
      mesh.position.y = 0.18;
      mesh.material.color.set('#8f5d44');
    };
    scene.add(bottle);
    combatSystem.registerShootable(bottle);
    collisionSystem.registerCylinder(bottle.position, 0.2, 0.7);
  }
}
