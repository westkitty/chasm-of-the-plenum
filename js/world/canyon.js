/**
 * Procedural Multi-Tier Rift Geometry & Architectural Formations
 * Satisfies SIMU-41 through SIMU-49, UIUX-49
 */
import { TextureSynthesizer } from './textures.js';

export class CanyonWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
    this.windmills = [];
    this.waterfalls = [];

    // Textures
    this.basaltTex = TextureSynthesizer.createBasaltTexture();
    this.timberTex = TextureSynthesizer.createTimberTexture();
    this.masonryTex = TextureSynthesizer.createMasonryTexture();
    this.crystalTex = TextureSynthesizer.createCrystalTexture();

    this.buildWorld();
  }

  buildWorld() {
    this.buildBasaltCliffs();
    this.buildHighScarp();
    this.buildMedianShelf();
    this.buildLowGut();
    this.buildGlassForest();
  }

  buildBasaltCliffs() {
    // Resonant basalt canyon walls (2000m long, 1500m high)
    const wallGeo = new THREE.BoxGeometry(60, 1500, 2400);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x222830,
      map: this.basaltTex,
      roughness: 0.85,
      metalness: 0.25
    });

    // West Cliff Wall
    const westWall = new THREE.Mesh(wallGeo, wallMat);
    westWall.position.set(-250, 750, 0);
    westWall.receiveShadow = true;
    this.scene.add(westWall);

    // East Cliff Wall
    const eastWall = new THREE.Mesh(wallGeo, wallMat);
    eastWall.position.set(250, 750, 0);
    eastWall.receiveShadow = true;
    this.scene.add(eastWall);

    // Canyon Floor Bed
    const floorGeo = new THREE.PlaneGeometry(500, 2400, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x12151a,
      map: this.basaltTex,
      roughness: 0.95,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 50, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Overhanging rock buttresses and arches
    for (let b = -4; b <= 4; b++) {
      const buttressGeo = new THREE.ConeGeometry(30, 180, 5);
      const buttressMat = new THREE.MeshStandardMaterial({
        color: 0x1a2028,
        map: this.basaltTex,
        roughness: 0.9
      });
      const buttress = new THREE.Mesh(buttressGeo, buttressMat);
      buttress.position.set(-220, 750 + (b % 2) * 60, b * 240);
      buttress.rotation.z = Math.PI / 4;
      this.scene.add(buttress);
    }
  }

  buildHighScarp() {
    // SIMU-42: Glacis of Keth (1,400m altitude plateau)
    const scarpGroup = new THREE.Group();

    // Highland Lip Terraces
    const lipGeo = new THREE.BoxGeometry(160, 20, 500);
    const lipMat = new THREE.MeshStandardMaterial({
      color: 0x2e3540,
      map: this.basaltTex,
      roughness: 0.7
    });
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.position.set(-150, 1400, 0);
    lip.receiveShadow = true;
    scarpGroup.add(lip);

    // Great Cistern Rim (Circular reservoir)
    const cisternGroup = new THREE.Group();
    cisternGroup.userData = { type: 'cistern' };

    const cisternGeo = new THREE.CylinderGeometry(100, 100, 30, 32, 1, false);
    const cisternMat = new THREE.MeshStandardMaterial({
      color: 0x3d4957,
      map: this.masonryTex,
      roughness: 0.6
    });
    const cistern = new THREE.Mesh(cisternGeo, cisternMat);
    cistern.position.set(-150, 1415, -120);
    cistern.castShadow = true;
    cisternGroup.add(cistern);

    // Three Spires inside cistern
    for (let i = -1; i <= 1; i++) {
      const spireGeo = new THREE.ConeGeometry(5, 60, 8);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x667788, metalness: 0.7 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(-150 + i * 25, 1445, -120);
      cisternGroup.add(spire);
    }

    scarpGroup.add(cisternGroup);

    // Cascading Overflow Water Flume from Cistern down cliff
    const waterFlumeGeo = new THREE.PlaneGeometry(12, 600, 8, 32);
    const waterFlumeMat = new THREE.MeshStandardMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1,
      metalness: 0.8
    });
    const waterFlume = new THREE.Mesh(waterFlumeGeo, waterFlumeMat);
    waterFlume.position.set(-198, 1100, -120);
    waterFlume.rotation.y = Math.PI / 2;
    scarpGroup.add(waterFlume);
    this.waterfalls.push(waterFlume);

    // Windmills of the Scour (Rotating vanes)
    for (let j = 0; j < 4; j++) {
      const millGroup = new THREE.Group();
      millGroup.position.set(-180, 1420, 60 + j * 70);

      const millPole = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2.5, 45, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8 })
      );
      millPole.castShadow = true;
      millGroup.add(millPole);

      // Rotating Hub & Vanes
      const vaneHub = new THREE.Group();
      vaneHub.position.set(0, 22, 0);

      const vaneGeo = new THREE.BoxGeometry(28, 1.2, 4);
      const vaneMat = new THREE.MeshStandardMaterial({
        color: 0xbbaa99,
        map: this.timberTex,
        roughness: 0.8
      });

      const vane1 = new THREE.Mesh(vaneGeo, vaneMat);
      vaneHub.add(vane1);

      const vane2 = new THREE.Mesh(vaneGeo, vaneMat);
      vane2.rotation.z = Math.PI / 2;
      vaneHub.add(vane2);

      millGroup.add(vaneHub);
      scarpGroup.add(millGroup);
      this.windmills.push(vaneHub);
    }

    this.scene.add(scarpGroup);
  }

  buildMedianShelf() {
    // SIMU-43: Strake of Tal-Mor (710m altitude median cliff-city)
    const shelfGroup = new THREE.Group();

    // Main Promenade Ledge
    const shelfGeo = new THREE.BoxGeometry(90, 15, 700);
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0x3d2f24,
      map: this.basaltTex,
      roughness: 0.8
    });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-180, 710, 0);
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);

    // Stepped corbel dwellings jutting from cliff with illuminated windows
    for (let i = 0; i < 8; i++) {
      const houseGeo = new THREE.BoxGeometry(32, 28, 48);
      const houseMat = new THREE.MeshStandardMaterial({
        color: 0x5a4836,
        map: this.masonryTex,
        roughness: 0.8
      });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(-205, 730 + i * 8, -200 + i * 60);
      house.castShadow = true;
      shelfGroup.add(house);

      // Hanging lanterns with warm glow
      const lanternGeo = new THREE.SphereGeometry(0.8, 8, 8);
      const lanternMat = new THREE.MeshStandardMaterial({
        color: 0xffbb44,
        emissive: 0xff8811,
        emissiveIntensity: 1.5
      });
      const lantern = new THREE.Mesh(lanternGeo, lanternMat);
      lantern.position.set(-185, 722 + i * 8, -200 + i * 60);
      shelfGroup.add(lantern);
    }

    // Siphon-Bourse Arcade Platform & Colonnade
    const bourseGroup = new THREE.Group();
    bourseGroup.userData = { type: 'bourse' };

    const bourseBase = new THREE.Mesh(
      new THREE.CylinderGeometry(45, 55, 12, 16),
      new THREE.MeshStandardMaterial({ color: 0x5a4a38, map: this.masonryTex, roughness: 0.7 })
    );
    bourseBase.position.set(-145, 710, 80);
    bourseBase.receiveShadow = true;
    bourseGroup.add(bourseBase);

    // Colonnade Pillars
    for (let p = 0; p < 8; p++) {
      const angle = (p / 8) * Math.PI * 2;
      const px = -145 + Math.cos(angle) * 35;
      const pz = 80 + Math.sin(angle) * 35;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 24, 8),
        new THREE.MeshStandardMaterial({ color: 0x776655, map: this.masonryTex })
      );
      pillar.position.set(px, 728, pz);
      pillar.castShadow = true;
      bourseGroup.add(pillar);
    }

    // Copper Domed Roof
    const domeGeo = new THREE.SphereGeometry(36, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0x4a7c6f, // Patinated verdigris copper
      metalness: 0.8,
      roughness: 0.3
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(-145, 740, 80);
    dome.castShadow = true;
    bourseGroup.add(dome);

    shelfGroup.add(bourseGroup);
    this.scene.add(shelfGroup);
  }

  buildLowGut() {
    // SIMU-44: Sluice-Wharf Nine (50m chasm floor)
    const gutGroup = new THREE.Group();

    // Timber Wharf Planking
    const wharfGeo = new THREE.BoxGeometry(150, 8, 260);
    const wharfMat = new THREE.MeshStandardMaterial({
      color: 0x33261a,
      map: this.timberTex,
      roughness: 0.9
    });
    const wharf = new THREE.Mesh(wharfGeo, wharfMat);
    wharf.position.set(-80, 54, 0);
    wharf.receiveShadow = true;
    gutGroup.add(wharf);

    // Heavy wooden pilings underneath
    for (let px = -140; px <= -20; px += 30) {
      for (let pz = -120; pz <= 120; pz += 40) {
        const piling = new THREE.Mesh(
          new THREE.CylinderGeometry(2, 2.5, 45, 6),
          new THREE.MeshStandardMaterial({ color: 0x1f1812, map: this.timberTex })
        );
        piling.position.set(px, 32, pz);
        gutGroup.add(piling);
      }
    }

    // Boiling Kelp Cauldrons over geothermal vents
    for (let k = 0; k < 3; k++) {
      const cauldGeo = new THREE.CylinderGeometry(14, 11, 16, 16);
      const cauldMat = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.85,
        roughness: 0.3
      });
      const cauld = new THREE.Mesh(cauldGeo, cauldMat);
      cauld.position.set(-50, 62, -60 + k * 45);
      cauld.castShadow = true;
      gutGroup.add(cauld);

      // Lava/geothermal vent glow beneath cauldron
      const fire = new THREE.PointLight(0xff5511, 2.5, 30);
      fire.position.set(-50, 56, -60 + k * 45);
      gutGroup.add(fire);
    }

    this.scene.add(gutGroup);
  }

  buildGlassForest() {
    // SIMU-45: Vitreous Reach (Crystalline Silic-Cane Forest)
    const forestGroup = new THREE.Group();

    // Silic-cane trees with crystal branches
    for (let n = 0; n < 45; n++) {
      const treeGroup = new THREE.Group();
      const x = 50 + (n % 6) * 20 + (Math.sin(n) * 10);
      const z = -220 + n * 11;
      const height = 35 + (n % 4) * 8;

      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.8, 1.4, height, 6);
      const trunkMat = new THREE.MeshStandardMaterial({
        color: 0x77ddcc,
        map: this.crystalTex,
        roughness: 0.1,
        metalness: 0.4,
        transparent: true,
        opacity: 0.85
      });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = height / 2;
      treeGroup.add(trunk);

      // Crystalline Spire Crown
      const crownGeo = new THREE.ConeGeometry(4.5, 14, 6);
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xaaeeff,
        emissive: 0x228877,
        emissiveIntensity: 0.4,
        roughness: 0.1,
        metalness: 0.6,
        transparent: true,
        opacity: 0.9
      });
      const crown = new THREE.Mesh(crownGeo, crownMat);
      crown.position.y = height + 6;
      treeGroup.add(crown);

      treeGroup.position.set(x, 50, z);
      forestGroup.add(treeGroup);
    }

    this.scene.add(forestGroup);
  }

  update(deltaSec) {
    // Spin windmill vanes with wind
    for (const vane of this.windmills) {
      vane.rotation.z += deltaSec * 2.2;
    }

    // Scroll waterfall UV
    for (const wf of this.waterfalls) {
      if (wf.material.map) {
        wf.material.map.offset.y -= deltaSec * 1.5;
      }
    }
  }
}
