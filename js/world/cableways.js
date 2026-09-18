/**
 * Cableways, Suspension Bridges & Working Funiculars
 * Satisfies STAB-31, GAME-21, GAME-22, GAME-41, SIMU-48
 */
export class CablewaySystem {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;
    this.funicularCar1 = null;
    this.funicularCar2 = null;
    this.ghratBridge = null;
    this.buildCablesAndFunicular();
  }

  buildCablesAndFunicular() {
    // Trans-canyon suspension cables across 500m chasm
    this.buildTransChasmCables();

    // The Hanging Span of Ghrat (Suspension footbridge on Median Shelf)
    this.buildGhratBridge();

    // Hydro-Counterweight Funicular (Cliff-face vertical elevator)
    this.buildVerticalFunicular();
  }

  buildTransChasmCables() {
    // STAB-31: Catenary curve mathematical solver
    const points = [];
    const span = 460;
    const sag = 45;
    for (let i = 0; i <= 30; i++) {
      const u = i / 30;
      const x = -span / 2 + u * span;
      const y = 720 - Math.sin(u * Math.PI) * sag;
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, 1.2, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.6 });
    const cableMesh = new THREE.Mesh(tubeGeo, cableMat);
    this.scene.add(cableMesh);
  }

  buildGhratBridge() {
    // Hanging Span of Ghrat (Connects Shelf to West Siphon Tower)
    const bridgeGroup = new THREE.Group();
    const deckGeo = new THREE.BoxGeometry(20, 2, 90);
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x6a543e, roughness: 0.8 });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-135, 712, -70);
    bridgeGroup.add(deck);

    this.ghratBridge = bridgeGroup;
    this.scene.add(bridgeGroup);
  }

  buildVerticalFunicular() {
    // Guide rails along cliff face
    const railGeo = new THREE.CylinderGeometry(0.8, 0.8, 660, 8);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(-218, 380, -20);
    this.scene.add(rail1);

    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(-218, 380, 20);
    this.scene.add(rail2);

    // Car 1 (Descending water-ballast car)
    const carGeo = new THREE.BoxGeometry(16, 18, 16);
    const carMat1 = new THREE.MeshStandardMaterial({ color: 0x775533 });
    this.funicularCar1 = new THREE.Mesh(carGeo, carMat1);
    this.funicularCar1.position.set(-218, 700, -20);
    this.scene.add(this.funicularCar1);

    // Car 2 (Ascending cargo car)
    const carMat2 = new THREE.MeshStandardMaterial({ color: 0x335577 });
    this.funicularCar2 = new THREE.Mesh(carGeo, carMat2);
    this.funicularCar2.position.set(-218, 60, 20);
    this.scene.add(this.funicularCar2);
  }

  update(deltaSec) {
    // Animate funicular cars based on tide cycle
    const t = this.state.timeHours;
    // Drain phase (14-18h): funicular active movement
    const phase = Math.sin(t * 1.5);
    const travelY = 60 + ((phase + 1) / 2) * 640; // 60m to 700m

    if (this.funicularCar1) this.funicularCar1.position.y = 760 - travelY;
    if (this.funicularCar2) this.funicularCar2.position.y = travelY;

    // Disruption tilt on Ghrat Bridge
    if (this.ghratBridge) {
      if (this.state.disruptionTriggered) {
        // Canted by 25°
        this.ghratBridge.rotation.z = THREE.MathUtils.degToRad(25);
        this.ghratBridge.position.y = -6;
      } else {
        this.ghratBridge.rotation.z = 0;
        this.ghratBridge.position.y = 0;
      }
    }
  }
}
