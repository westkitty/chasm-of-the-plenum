/**
 * Dynamic Undulating Brine Ocean with Real-Time Wave Geometry
 * Satisfies SIMU-02, SIMU-04
 */
import { TextureSynthesizer } from './textures.js';

export class BrineOcean {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;
    this.timeSec = 0;

    // Subdivided wave plane (128x128 for rich wave ripple simulation)
    this.geo = new THREE.PlaneGeometry(500, 2400, 64, 64);
    this.geo.dynamic = true;

    // Store original flat positions
    this.posAttr = this.geo.attributes.position;
    this.basePositions = new Float32Array(this.posAttr.array);

    const waterTex = TextureSynthesizer.createWaterTexture();

    this.mat = new THREE.MeshStandardMaterial({
      color: 0x144438,
      roughness: 0.15,
      metalness: 0.5,
      map: waterTex,
      transparent: true,
      opacity: 0.92
    });

    this.mesh = new THREE.Mesh(this.geo, this.mat);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.set(0, 50, 0); // Base floor Y=50
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    // Geothermal boiling vent rings
    this.ventRings = [];
    for (let k = 0; k < 3; k++) {
      const ringGeo = new THREE.RingGeometry(8, 20, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x66ffcc,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(-50, 50.2, -60 + k * 45);
      this.scene.add(ring);
      this.ventRings.push(ring);
    }
  }

  update(deltaSec) {
    this.timeSec += deltaSec;
    const t = this.timeSec;

    // 1. Dynamic sine wave vertex displacement
    const pos = this.posAttr.array;
    const base = this.basePositions;
    const count = pos.length / 3;

    // Flood elevation
    const flood = this.state.floodDepth || 0;
    this.mesh.position.y = 50 + flood;

    // Wave amplitude increases with Gush stroke (when flood is high)
    const waveAmp = 1.0 + (flood / 60.0) * 2.5;

    for (let i = 0; i < count; i++) {
      const x = base[i * 3];
      const y = base[i * 3 + 1]; // In PlaneGeometry, Y is the Z axis before rotation

      // Wave ripple formula
      const wave = Math.sin(x * 0.05 + t * 2.0) * Math.cos(y * 0.03 + t * 1.6) * waveAmp;
      pos[i * 3 + 2] = wave; // Z displacement becomes vertical world Y after -PI/2 rotation
    }

    this.posAttr.needsUpdate = true;
    this.geo.computeVertexNormals();

    // 2. Animate boiling vent rings
    for (let k = 0; k < this.ventRings.length; k++) {
      const ring = this.ventRings[k];
      ring.position.y = 50 + flood + 0.2;
      const pulse = 1.0 + Math.sin(t * 3.0 + k) * 0.25;
      ring.scale.set(pulse, pulse, 1);
      ring.rotation.z += deltaSec * 0.5;
    }
  }
}
