/**
 * 3D Characters & Autonomous Inhabitants
 * Renders the 3D Player Avatar and all 20 Citizens across the canyon tiers.
 * Satisfies SIMU-11 through SIMU-30, GAME-11, GAME-12
 */

export class CharacterSystem {
  constructor(scene, state, npcsEngine) {
    this.scene = scene;
    this.state = state;
    this.npcsEngine = npcsEngine;

    this.playerGroup = null;
    this.playerLeftLeg = null;
    this.playerRightLeg = null;
    this.playerLeftArm = null;
    this.playerRightArm = null;
    this.playerGillLight = null;
    this.playerGillMat = null;

    this.npcMeshes = new Map();
    this.walkCycle = 0;

    this.buildPlayerAvatar();
    this.buildCitizens();
  }

  buildPlayerAvatar() {
    this.playerGroup = new THREE.Group();

    // 1. Torso & Scavenger Tunic
    const torsoGeo = new THREE.BoxGeometry(1.2, 1.8, 0.8);
    const torsoMat = new THREE.MeshStandardMaterial({
      color: 0x3d352e, // Weathered leather
      roughness: 0.8,
      metalness: 0.1
    });
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 1.9;
    torso.castShadow = true;
    this.playerGroup.add(torso);

    // 2. Costal Gill-Cleft Lanterns along ribcage
    const gillGeo = new THREE.BoxGeometry(1.25, 0.5, 0.85);
    this.playerGillMat = new THREE.MeshStandardMaterial({
      color: 0x22eecc,
      emissive: 0x119988,
      emissiveIntensity: 1.2,
      roughness: 0.2
    });
    const gillMesh = new THREE.Mesh(gillGeo, this.playerGillMat);
    gillMesh.position.y = 1.7;
    this.playerGroup.add(gillMesh);

    this.playerGillLight = new THREE.PointLight(0x22eecc, 0.8, 8);
    this.playerGillLight.position.set(0, 1.7, 0.6);
    this.playerGroup.add(this.playerGillLight);

    // 3. Head & Scavenger Cowl
    const headGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x28231d, roughness: 0.9 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 3.1;
    head.castShadow = true;
    this.playerGroup.add(head);

    // Brass goggles visor
    const visorGeo = new THREE.BoxGeometry(0.7, 0.2, 0.2);
    const visorMat = new THREE.MeshStandardMaterial({ color: 0xcc9933, metalness: 0.8, roughness: 0.3 });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 3.1, 0.42);
    this.playerGroup.add(visor);

    // 4. Survival Water Flask Backpack
    const packGeo = new THREE.BoxGeometry(0.9, 1.3, 0.5);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.7 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 2.0, -0.6);
    this.playerGroup.add(pack);

    // Flask cylinder
    const flaskGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 8);
    const flaskMat = new THREE.MeshStandardMaterial({ color: 0x4488aa, metalness: 0.6 });
    const flask = new THREE.Mesh(flaskGeo, flaskMat);
    flask.position.set(0.35, 2.0, -0.65);
    this.playerGroup.add(flask);

    // 5. Limbs (Arms & Legs for walk animation)
    const limbMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.9 });
    const legGeo = new THREE.BoxGeometry(0.4, 1.4, 0.4);

    // Left Leg
    this.playerLeftLeg = new THREE.Mesh(legGeo, limbMat);
    this.playerLeftLeg.position.set(-0.35, 0.7, 0);
    this.playerLeftLeg.castShadow = true;
    this.playerGroup.add(this.playerLeftLeg);

    // Right Leg
    this.playerRightLeg = new THREE.Mesh(legGeo, limbMat);
    this.playerRightLeg.position.set(0.35, 0.7, 0);
    this.playerRightLeg.castShadow = true;
    this.playerGroup.add(this.playerRightLeg);

    // Arms
    const armGeo = new THREE.BoxGeometry(0.35, 1.2, 0.35);
    this.playerLeftArm = new THREE.Mesh(armGeo, limbMat);
    this.playerLeftArm.position.set(-0.8, 1.8, 0);
    this.playerGroup.add(this.playerLeftArm);

    this.playerRightArm = new THREE.Mesh(armGeo, limbMat);
    this.playerRightArm.position.set(0.8, 1.8, 0);
    this.playerGroup.add(this.playerRightArm);

    // Initial position
    const p = this.state.player;
    this.playerGroup.position.set(p.x, p.y, p.z);
    this.scene.add(this.playerGroup);
  }

  buildCitizens() {
    const npcs = this.npcsEngine.npcs;

    // Distinct heraldic colors per tier
    const tierColors = {
      Highland: 0x336699, // Azure water warden robes
      Shelf: 0x885533,    // Terracotta basalt artisan robes
      Gut: 0x335544       // Algal kelp harvester green
    };

    // Designated tier zones
    // Highland: X=-150, Y=1410, Z=-150 to +150
    // Shelf: X=-160, Y=710, Z=-250 to +250
    // Gut: X=-60, Y=54, Z=-100 to +100

    npcs.forEach((npc, idx) => {
      const citizenGroup = new THREE.Group();
      citizenGroup.userData = {
        type: 'npc',
        npcId: npc.id,
        name: npc.name,
        role: npc.role,
        tier: npc.tier
      };

      const isStilts = (npc.tier === 'Gut' && (idx % 2 === 0)); // Lowlanders on mud stilts

      // Torso
      const robeColor = tierColors[npc.tier] || 0x555555;
      const torsoMat = new THREE.MeshStandardMaterial({ color: robeColor, roughness: 0.8 });
      const torsoGeo = new THREE.BoxGeometry(1.0, 1.5, 0.7);
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = isStilts ? 5.2 : 1.6;
      torso.castShadow = true;
      citizenGroup.add(torso);

      // Head
      const headMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
      const headGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = isStilts ? 6.3 : 2.6;
      citizenGroup.add(head);

      // Hat / Hood
      const hatGeo = new THREE.ConeGeometry(0.6, 0.5, 6);
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
      const hat = new THREE.Mesh(hatGeo, hatMat);
      hat.position.y = isStilts ? 6.7 : 3.0;
      citizenGroup.add(hat);

      // Costal Gill Lantern
      const lampGeo = new THREE.SphereGeometry(0.18, 8, 8);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0x44ffaa,
        emissive: 0x22cc77,
        emissiveIntensity: 0.8
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(0, isStilts ? 5.1 : 1.5, 0.42);
      citizenGroup.add(lamp);

      if (isStilts) {
        // 4-meter mechanical mud-stilts (SIMU-13, SIMU-14)
        const stiltMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
        const stiltGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.4, 6);
        const leftStilt = new THREE.Mesh(stiltGeo, stiltMat);
        leftStilt.position.set(-0.35, 2.2, 0);
        citizenGroup.add(leftStilt);

        const rightStilt = new THREE.Mesh(stiltGeo, stiltMat);
        rightStilt.position.set(0.35, 2.2, 0);
        citizenGroup.add(rightStilt);
      } else {
        // Legs
        const legMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const legGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3);
        const lLeg = new THREE.Mesh(legGeo, legMat);
        lLeg.position.set(-0.28, 0.6, 0);
        citizenGroup.add(lLeg);

        const rLeg = new THREE.Mesh(legGeo, legMat);
        rLeg.position.set(0.28, 0.6, 0);
        citizenGroup.add(rLeg);
      }

      // Initial tier positioning
      let px = -160, py = 710, pz = 0;
      if (npc.tier === 'Highland') {
        px = -140 + (idx % 3) * 12;
        py = 1410;
        pz = -120 + (idx * 30);
      } else if (npc.tier === 'Shelf') {
        px = -170 + (idx % 3) * 15;
        py = 710;
        pz = -220 + (idx * 28);
      } else {
        // Gut
        px = -70 + (idx % 2) * 20;
        py = 54;
        pz = -80 + (idx * 25);
      }

      citizenGroup.position.set(px, py, pz);
      this.scene.add(citizenGroup);
      this.npcMeshes.set(npc.id, {
        group: citizenGroup,
        baseX: px,
        baseY: py,
        baseZ: pz,
        patrolOffset: idx * 1.5,
        tier: npc.tier
      });
    });
  }

  update(deltaSec, isMoving) {
    // 1. Update Player Avatar Position & Animation
    const p = this.state.player;
    if (this.playerGroup) {
      this.playerGroup.position.set(p.x, p.y, p.z);

      // Walk cycle limb rotation
      if (isMoving) {
        this.walkCycle += deltaSec * (this.state.player.stamina < 20 ? 8 : 12);
        const angle = Math.sin(this.walkCycle) * 0.45;
        this.playerLeftLeg.rotation.x = angle;
        this.playerRightLeg.rotation.x = -angle;
        this.playerLeftArm.rotation.x = -angle;
        this.playerRightArm.rotation.x = angle;
      } else {
        // Idle damp
        this.playerLeftLeg.rotation.x = 0;
        this.playerRightLeg.rotation.x = 0;
        this.playerLeftArm.rotation.x = 0;
        this.playerRightArm.rotation.x = 0;
      }

      // Costal cleft illumination based on vitrification percentage
      const vit = p.vitrification || 0;
      if (vit > 50) {
        // Warning: red alert
        const pulse = 0.5 + Math.sin(Date.now() * 0.008) * 0.5;
        this.playerGillMat.color.setHex(0xff2222);
        this.playerGillMat.emissive.setHex(0xaa1111);
        this.playerGillLight.color.setHex(0xff2222);
        this.playerGillLight.intensity = 0.5 + pulse * 1.2;
      } else if (vit > 25) {
        // Amber warning
        this.playerGillMat.color.setHex(0xffaa22);
        this.playerGillMat.emissive.setHex(0x885511);
        this.playerGillLight.color.setHex(0xffaa22);
        this.playerGillLight.intensity = 0.8;
      } else {
        // Healthy cyan
        this.playerGillMat.color.setHex(0x22eecc);
        this.playerGillMat.emissive.setHex(0x119988);
        this.playerGillLight.color.setHex(0x22eecc);
        this.playerGillLight.intensity = 0.8;
      }
    }

    // 2. Animate Autonomous Citizens
    const t = this.state.timeHours;
    for (const [id, data] of this.npcMeshes.entries()) {
      const g = data.group;
      const patrolSpeed = 0.8;
      const patrolRange = 18;
      const offset = Math.sin(t * 3.0 + data.patrolOffset) * patrolRange;

      g.position.z = data.baseZ + offset;

      // Adjust Gut citizens for rising brine ocean
      if (data.tier === 'Gut') {
        const flood = this.state.floodDepth || 0;
        // Evacuate to higher piers if flooded
        g.position.y = Math.max(data.baseY, 50 + flood + 0.5);
      }

      // Slight head / body breathe wobble
      g.rotation.y = offset > 0 ? 0 : Math.PI;
    }
  }
}
