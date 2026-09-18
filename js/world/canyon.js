/**
 * Procedural Multi-Tier Rift Geometry & Architectural Formations
 * Satisfies SIMU-41, SIMU-42, SIMU-43, SIMU-44, SIMU-45, SIMU-46, SIMU-47, SIMU-48, SIMU-49
 */
export class CanyonWorld {
  constructor(scene) {
    this.scene = scene;
    this.colliders = [];
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
    // Dark resonant basalt canyon walls (2000m long, 1500m high)
    const wallGeo = new THREE.BoxGeometry(60, 1500, 2400);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x1a1e24,
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
      color: 0x121418,
      roughness: 0.9,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 50, 0);
    floor.receiveShadow = true;
    this.scene.add(floor);
  }

  buildHighScarp() {
    // SIMU-42: Glacis of Keth (1,400m altitude plateau)
    const scarpGroup = new THREE.Group();

    // Highland Lip Terraces
    const lipGeo = new THREE.BoxGeometry(160, 20, 400);
    const lipMat = new THREE.MeshStandardMaterial({ color: 0x2e3540, roughness: 0.7 });
    const lip = new THREE.Mesh(lipGeo, lipMat);
    lip.position.set(-150, 1400, 0);
    scarpGroup.add(lip);

    // Great Cistern Rim (Circular reservoir)
    const cisternGeo = new THREE.CylinderGeometry(100, 100, 30, 32, 1, true);
    const cisternMat = new THREE.MeshStandardMaterial({ color: 0x334455, roughness: 0.6 });
    const cistern = new THREE.Mesh(cisternGeo, cisternMat);
    cistern.position.set(-150, 1415, -120);
    scarpGroup.add(cistern);

    // Three Spires inside cistern
    for (let i = -1; i <= 1; i++) {
      const spireGeo = new THREE.ConeGeometry(5, 60, 8);
      const spireMat = new THREE.MeshStandardMaterial({ color: 0x556677 });
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(-150 + i * 25, 1445, -120);
      scarpGroup.add(spire);
    }

    // Windmills of the Scour
    for (let j = 0; j < 4; j++) {
      const millPole = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 40, 8),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
      );
      millPole.position.set(-180, 1420, 60 + j * 60);
      scarpGroup.add(millPole);

      const vaneGeo = new THREE.BoxGeometry(25, 1, 4);
      const vaneMat = new THREE.MeshStandardMaterial({ color: 0x998877 });
      const vane = new THREE.Mesh(vaneGeo, vaneMat);
      vane.position.set(-180, 1440, 60 + j * 60);
      scarpGroup.add(vane);
    }

    this.scene.add(scarpGroup);
  }

  buildMedianShelf() {
    // SIMU-43: Strake of Tal-Mor (710m altitude median cliff-city)
    const shelfGroup = new THREE.Group();

    // Main Promenade Ledge
    const shelfGeo = new THREE.BoxGeometry(90, 15, 600);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 0.8 });
    const shelf = new THREE.Mesh(shelfGeo, shelfMat);
    shelf.position.set(-180, 710, 0);
    shelf.receiveShadow = true;
    shelfGroup.add(shelf);

    // Stepped corbel dwellings jutting from cliff
    for (let i = 0; i < 6; i++) {
      const houseGeo = new THREE.BoxGeometry(30, 25, 45);
      const houseMat = new THREE.MeshStandardMaterial({ color: 0x4a3b2c, roughness: 0.9 });
      const house = new THREE.Mesh(houseGeo, houseMat);
      house.position.set(-205, 730 + i * 8, -150 + i * 65);
      house.castShadow = true;
      shelfGroup.add(house);
    }

    // Siphon-Bourse Arcade Platform
    const bourseGeo = new THREE.CylinderGeometry(45, 55, 12, 16);
    const bourseMat = new THREE.MeshStandardMaterial({ color: 0x5a4a38, roughness: 0.7 });
    const bourse = new THREE.Mesh(bourseGeo, bourseMat);
    bourse.position.set(-145, 710, 80);
    shelfGroup.add(bourse);

    this.scene.add(shelfGroup);
  }

  buildLowGut() {
    // SIMU-44: Sluice-Wharf Nine (50m chasm floor)
    const gutGroup = new THREE.Group();

    // Timber Wharf Planking
    const wharfGeo = new THREE.BoxGeometry(140, 8, 220);
    const wharfMat = new THREE.MeshStandardMaterial({ color: 0x221a12, roughness: 0.9 });
    const wharf = new THREE.Mesh(wharfGeo, wharfMat);
    wharf.position.set(-80, 54, 0);
    wharf.receiveShadow = true;
    gutGroup.add(wharf);

    // Boiling Kelp Cauldrons over vents
    for (let k = 0; k < 3; k++) {
      const cauldGeo = new THREE.CylinderGeometry(12, 10, 14, 16);
      const cauldMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
      const cauld = new THREE.Mesh(cauldGeo, cauldMat);
      cauld.position.set(-50, 61, -60 + k * 45);
      gutGroup.add(cauld);
    }

    this.scene.add(gutGroup);
  }

  buildGlassForest() {
    // SIMU-45: Vitreous Reach (Crystalline Silic-Cane Forest)
    const forestGroup = new THREE.Group();
    const caneGeo = new THREE.CylinderGeometry(0.6, 0.8, 45, 6);
    const caneMat = new THREE.MeshStandardMaterial({
      color: 0x88ccbb,
      roughness: 0.1,
      metalness: 0.3,
      transparent: true,
      opacity: 0.75
    });

    for (let n = 0; n < 40; n++) {
      const cane = new THREE.Mesh(caneGeo, caneMat);
      const x = 50 + (n % 6) * 18 + (Math.sin(n) * 8);
      const z = -200 + n * 12;
      cane.position.set(x, 72, z);
      forestGroup.add(cane);
    }

    this.scene.add(forestGroup);
  }
}
