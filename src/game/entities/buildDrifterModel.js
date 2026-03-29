import * as THREE from 'three';

function makeCapsuleLimb(radius, length, material, yOffset) {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, length, 5, 10), material);
  mesh.position.y = yOffset;
  mesh.castShadow = true;
  return mesh;
}

function makeLimbPivot(x, y, z) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, z);
  return pivot;
}

export function buildDrifterModel() {
  const root = new THREE.Group();
  const rig = {};

  const materials = {
    skin: new THREE.MeshStandardMaterial({ color: '#b88b6b', roughness: 0.85 }),
    coat: new THREE.MeshStandardMaterial({ color: '#3e2f29', roughness: 0.95 }),
    shirt: new THREE.MeshStandardMaterial({ color: '#68685a', roughness: 0.9 }),
    denim: new THREE.MeshStandardMaterial({ color: '#2e3f4b', roughness: 0.95 }),
    leather: new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: 0.88 }),
    dark: new THREE.MeshStandardMaterial({ color: '#1f1a17', roughness: 0.9 }),
    metal: new THREE.MeshStandardMaterial({ color: '#6f695f', roughness: 0.55, metalness: 0.35 }),
    bandana: new THREE.MeshStandardMaterial({ color: '#6c4034', roughness: 0.9 }),
    hair: new THREE.MeshStandardMaterial({ color: '#403127', roughness: 0.92 })
  };

  const hips = new THREE.Group();
  root.add(hips);
  rig.hips = hips;

  const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.28, 0.24), materials.denim);
  pelvis.position.set(0, 0.96, 0);
  pelvis.castShadow = true;
  hips.add(pelvis);

  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.2), materials.coat);
  waist.position.set(0, 1.1, 0.02);
  waist.castShadow = true;
  hips.add(waist);

  const torsoPivot = makeLimbPivot(0, 1.12, 0);
  hips.add(torsoPivot);
  rig.torso = torsoPivot;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.72, 6, 12), materials.coat);
  torso.position.y = 0.34;
  torso.scale.set(1.1, 1.05, 0.92);
  torso.castShadow = true;
  torsoPivot.add(torso);

  const ribcage = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.56, 0.28), materials.shirt);
  ribcage.position.set(0, 0.34, 0.03);
  ribcage.castShadow = true;
  torsoPivot.add(ribcage);

  const shoulderLine = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.18, 0.24), materials.coat);
  shoulderLine.position.set(0, 0.63, -0.01);
  shoulderLine.castShadow = true;
  torsoPivot.add(shoulderLine);

  const coatSkirt = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.42, 0.24), materials.coat);
  coatSkirt.position.set(0, -0.03, 0.01);
  coatSkirt.castShadow = true;
  torsoPivot.add(coatSkirt);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 12), materials.skin);
  neck.position.set(0, 0.86, 0);
  neck.castShadow = true;
  torsoPivot.add(neck);

  const bandana = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 10, 18), materials.bandana);
  bandana.rotation.x = Math.PI / 2;
  bandana.position.set(0, 0.79, 0.05);
  torsoPivot.add(bandana);

  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.04, 10, 20), materials.leather);
  belt.rotation.x = Math.PI / 2;
  belt.position.set(0, -0.12, 0.02);
  torsoPivot.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.07, 0.04), materials.metal);
  buckle.position.set(0, -0.14, 0.27);
  torsoPivot.add(buckle);

  const headPivot = makeLimbPivot(0, 0.96, 0.01);
  torsoPivot.add(headPivot);
  rig.head = headPivot;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 20), materials.skin);
  head.position.set(0, 0.16, 0.01);
  head.scale.set(0.94, 1.08, 0.92);
  head.castShadow = true;
  headPivot.add(head);

  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.18), materials.skin);
  jaw.position.set(0, 0.02, 0.05);
  jaw.castShadow = true;
  headPivot.add(jaw);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.205, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.65), materials.hair);
  hair.position.set(0, 0.22, -0.01);
  hair.castShadow = true;
  headPivot.add(hair);

  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.04, 24), materials.dark);
  hatBrim.position.set(0, 0.33, 0);
  hatBrim.castShadow = true;
  headPivot.add(hatBrim);

  const hatCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.24, 24), materials.dark);
  hatCrown.position.set(0, 0.45, 0);
  hatCrown.castShadow = true;
  headPivot.add(hatCrown);

  const leftArmPivot = makeLimbPivot(-0.42, 0.62, 0);
  torsoPivot.add(leftArmPivot);
  rig.leftArm = leftArmPivot;
  leftArmPivot.rotation.z = -0.14;
  leftArmPivot.add(makeCapsuleLimb(0.1, 0.42, materials.coat, -0.24));

  const leftElbowPivot = makeLimbPivot(0, -0.5, 0.02);
  leftArmPivot.add(leftElbowPivot);
  rig.leftElbow = leftElbowPivot;

  const leftForearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.082, 0.38, 4, 8), materials.coat);
  leftForearm.position.set(0, -0.22, 0.01);
  leftForearm.castShadow = true;
  leftElbowPivot.add(leftForearm);

  const leftHandPivot = makeLimbPivot(0, -0.47, 0.02);
  leftElbowPivot.add(leftHandPivot);
  rig.leftHand = leftHandPivot;
  const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.15, 0.075), materials.skin);
  leftHand.position.set(0, -0.02, 0.01);
  leftHand.castShadow = true;
  leftHandPivot.add(leftHand);

  const rightArmPivot = makeLimbPivot(0.42, 0.62, 0);
  torsoPivot.add(rightArmPivot);
  rig.rightArm = rightArmPivot;
  rightArmPivot.rotation.z = 0.14;
  rightArmPivot.add(makeCapsuleLimb(0.1, 0.42, materials.coat, -0.24));

  const rightElbowPivot = makeLimbPivot(0, -0.5, 0.02);
  rightArmPivot.add(rightElbowPivot);
  rig.rightElbow = rightElbowPivot;
  const rightForearm = leftForearm.clone();
  rightElbowPivot.add(rightForearm);

  const rightHandPivot = makeLimbPivot(0, -0.47, 0.02);
  rightElbowPivot.add(rightHandPivot);
  rig.rightHand = rightHandPivot;

  const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.08), materials.skin);
  rightHand.position.set(0, -0.02, 0.02);
  rightHand.castShadow = true;
  rightHandPivot.add(rightHand);

  const revolverGroup = new THREE.Group();
  revolverGroup.position.set(0.04, -0.01, 0.13);
  rightHandPivot.add(revolverGroup);
  rig.revolver = revolverGroup;

  const revolverBody = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.28), materials.dark);
  revolverBody.castShadow = true;
  revolverGroup.add(revolverBody);

  const revolverBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.26, 10), materials.metal);
  revolverBarrel.rotation.x = Math.PI / 2;
  revolverBarrel.position.set(0, 0.01, 0.23);
  revolverBarrel.castShadow = true;
  revolverGroup.add(revolverBarrel);

  const revolverGrip = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.17, 0.09), materials.leather);
  revolverGrip.position.set(0, -0.11, -0.03);
  revolverGrip.rotation.x = -0.35;
  revolverGrip.castShadow = true;
  revolverGroup.add(revolverGrip);

  const leftLegPivot = makeLimbPivot(-0.15, 1.12, 0);
  hips.add(leftLegPivot);
  rig.leftLeg = leftLegPivot;
  leftLegPivot.add(makeCapsuleLimb(0.12, 0.5, materials.denim, -0.28));

  const leftKneePivot = makeLimbPivot(0, -0.5, 0.02);
  leftLegPivot.add(leftKneePivot);
  rig.leftKnee = leftKneePivot;
  const leftShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.46, 4, 8), materials.denim);
  leftShin.position.set(0, -0.28, 0);
  leftShin.castShadow = true;
  leftKneePivot.add(leftShin);

  const rightLegPivot = makeLimbPivot(0.15, 1.12, 0);
  hips.add(rightLegPivot);
  rig.rightLeg = rightLegPivot;
  rightLegPivot.add(makeCapsuleLimb(0.12, 0.5, materials.denim, -0.28));

  const rightKneePivot = makeLimbPivot(0, -0.5, 0.02);
  rightLegPivot.add(rightKneePivot);
  rig.rightKnee = rightKneePivot;
  const rightShin = leftShin.clone();
  rightKneePivot.add(rightShin);

  const leftBootPivot = makeLimbPivot(0, -0.54, 0.04);
  leftKneePivot.add(leftBootPivot);
  rig.leftBoot = leftBootPivot;
  const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.46), materials.leather);
  leftBoot.position.set(0, 0, 0.1);
  leftBoot.castShadow = true;
  leftBootPivot.add(leftBoot);

  const rightBootPivot = makeLimbPivot(0, -0.54, 0.04);
  rightKneePivot.add(rightBootPivot);
  rig.rightBoot = rightBootPivot;
  const rightBoot = leftBoot.clone();
  rightBootPivot.add(rightBoot);

  const holsterPivot = makeLimbPivot(0.27, -0.02, 0.15);
  torsoPivot.add(holsterPivot);
  rig.holster = holsterPivot;
  holsterPivot.rotation.z = -0.22;
  const holster = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.36, 0.1), materials.leather);
  holster.position.y = -0.18;
  holster.castShadow = true;
  holsterPivot.add(holster);

  return { root, rig };
}
