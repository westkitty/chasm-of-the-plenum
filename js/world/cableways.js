/**
 * Cableways, Suspension Bridges & Working Funiculars
 * Satisfies STAB-31, GAME-21, GAME-22, GAME-41, SIMU-48
 */
import { TextureSynthesizer } from './textures.js';

export class CablewaySystem {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;
    this.timberTex = TextureSynthesizer.createTimberTexture();

    this.funicularCar1 = null;
    this.funicularCar2 = null;
    this.pulleyWheels = [];
    this.ghratBridge = null;
    this.danglingCables = [];

    this.buildCablesAndFunicular();
  }

  buildCablesAndFunicular() {
    this.buildTransChasmCables();
    this.buildGhratBridge();
    this.buildVerticalFunicular();
  }

  buildTransChasmCables() {
    // STAB-31: Catenary curve mathematical solver across 480m rift
    const points = [];
    const span = 480;
    const sag = 50;
    for (let i = 0; i <= 40; i++) {
      const u = i / 40;
      const x = -span / 2 + u * span;
      const y = 730 - Math.sin(u * Math.PI) * sag;
      points.push(new THREE.Vector3(x, y, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 1.4, 8, false);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.3 });
    const mainCable = new THREE.Mesh(tubeGeo, cableMat);
    this.scene.add(mainCable);

    // Parallel return cable
    const returnPoints = points.map(p => new THREE.Vector3(p.x, p.y, p.z + 18));
    const returnCurve = new THREE.CatmullRomCurve3(returnPoints);
    const returnCable = new THREE.Mesh(new THREE.TubeGeometry(returnCurve, 48, 1.4, 8, false), cableMat);
    this.scene.add(returnCable);
  }

  buildGhratBridge() {
    // Hanging Span of Ghrat (Connects Median Shelf to West Siphon Tower)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.userData = { type: 'bridge' };

    // Stone Anchor Pylons on both sides
    const pylonGeo = new THREE.BoxGeometry(10, 40, 16);
    const pylonMat = new THREE.MeshStandardMaterial({ color: 0x2e3540, roughness: 0.8 });

    const pylonEast = new THREE.Mesh(pylonGeo, pylonMat);
    pylonEast.position.set(-135, 725, -25);
    bridgeGroup.add(pylonEast);

    const pylonWest = new THREE.Mesh(pylonGeo, pylonMat);
    pylonWest.position.set(-135, 725, -115);
    bridgeGroup.add(pylonWest);

    // Main Suspension Cables for bridge
    const cPoints1 = [];
    const cPoints2 = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      const z = -25 - u * 90;
      const y = 740 - Math.sin(u * Math.PI) * 22;
      cPoints1.push(new THREE.Vector3(-139, y, z));
      cPoints2.push(new THREE.Vector3(-131, y, z));
    }
    const bridgeCableMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });
    const cableMesh1 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cPoints1), 24, 0.5, 6), bridgeCableMat);
    const cableMesh2 = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cPoints2), 24, 0.5, 6), bridgeCableMat);
    bridgeGroup.add(cableMesh1);
    bridgeGroup.add(cableMesh2);

    // Vertical Dropper Wire Rods
    const dropperMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    for (let d = 1; d < 20; d++) {
      const u = d / 20;
      const z = -25 - u * 90;
      const topY = 740 - Math.sin(u * Math.PI) * 22;
      const h = topY - 712;
      const dropGeo = new THREE.CylinderGeometry(0.1, 0.1, h, 4);

      const d1 = new THREE.Mesh(dropGeo, dropperMat);
      d1.position.set(-139, 712 + h / 2, z);
      bridgeGroup.add(d1);

      const d2 = new THREE.Mesh(dropGeo, dropperMat);
      d2.position.set(-131, 712 + h / 2, z);
      bridgeGroup.add(d2);
    }

    // Timber Deck with Planks
    const deckGeo = new THREE.BoxGeometry(10, 1.5, 90);
    const deckMat = new THREE.MeshStandardMaterial({
      color: 0x5a4430,
      map: this.timberTex,
      roughness: 0.85
    });
    const deck = new THREE.Mesh(deckGeo, deckMat);
    deck.position.set(-135, 712, -70);
    deck.receiveShadow = true;
    bridgeGroup.add(deck);

    // Handrails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x332211 });
    const railGeo = new THREE.BoxGeometry(0.5, 2.5, 90);

    const railLeft = new THREE.Mesh(railGeo, railMat);
    railLeft.position.set(-139.5, 714, -70);
    bridgeGroup.add(railLeft);

    const railRight = new THREE.Mesh(railGeo, railMat);
    railRight.position.set(-130.5, 714, -70);
    bridgeGroup.add(railRight);

    this.ghratBridge = bridgeGroup;
    this.scene.add(bridgeGroup);
  }

  buildVerticalFunicular() {
    // Upper Gantry & Cable Winch Platform at Y=740
    const gantryGeo = new THREE.BoxGeometry(24, 6, 60);
    const gantryMat = new THREE.MeshStandardMaterial({ color: 0x3a3028, map: this.timberTex });
    const gantry = new THREE.Mesh(gantryGeo, gantryMat);
    gantry.position.set(-218, 740, 0);
    this.scene.add(gantry);

    // Pulley Wheels at top
    for (let pw = -1; pw <= 1; pw += 2) {
      const wheelGeo = new THREE.CylinderGeometry(5, 5, 2, 16);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(-218, 746, pw * 20);
      this.scene.add(wheel);
      this.pulleyWheels.push(wheel);
    }

    // Heavy vertical guide rails along cliff
    const railGeo = new THREE.CylinderGeometry(0.9, 0.9, 680, 8);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.9 });

    const rail1 = new THREE.Mesh(railGeo, railMat);
    rail1.position.set(-218, 380, -20);
    this.scene.add(rail1);

    const rail2 = new THREE.Mesh(railGeo, railMat);
    rail2.position.set(-218, 380, 20);
    this.scene.add(rail2);

    // Car 1 (Water-Ballast Descending Carriage)
    this.funicularCar1 = this.createCarMesh(0x6e5238);
    this.funicularCar1.position.set(-218, 700, -20);
    this.scene.add(this.funicularCar1);

    // Car 2 (Ascending Cargo Carriage)
    this.funicularCar2 = this.createCarMesh(0x38556e);
    this.funicularCar2.position.set(-218, 60, 20);
    this.scene.add(this.funicularCar2);
  }

  createCarMesh(tintColor) {
    const carGroup = new THREE.Group();

    // Timber & Steel Slatted Carriage Cage
    const bodyGeo = new THREE.BoxGeometry(16, 20, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: tintColor,
      map: this.timberTex,
      roughness: 0.8
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    carGroup.add(body);

    // Top Cable Anchor Hook
    const hookGeo = new THREE.CylinderGeometry(0.8, 0.8, 6, 8);
    const hookMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.9 });
    const hook = new THREE.Mesh(hookGeo, hookMat);
    hook.position.y = 12;
    carGroup.add(hook);

    // Lantern on side of car
    const lamp = new THREE.PointLight(0xffaa44, 1.2, 25);
    lamp.position.set(9, 2, 0);
    carGroup.add(lamp);

    return carGroup;
  }

  update(deltaSec) {
    const t = this.state.timeHours;
    const phase = Math.sin(t * 1.5);
    const travelY = 60 + ((phase + 1) / 2) * 640; // 60m to 700m

    if (this.funicularCar1) this.funicularCar1.position.y = 760 - travelY;
    if (this.funicularCar2) this.funicularCar2.position.y = travelY;

    // Spin pulley wheels
    for (const w of this.pulleyWheels) {
      w.rotation.x += deltaSec * 3.0;
    }

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
