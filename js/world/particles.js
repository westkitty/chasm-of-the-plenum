/**
 * Volumetric Particle Atmosphere & Dynamic FX
 * Satisfies SIMU-03, SIMU-09, GAME-41
 */

export class ParticleAtmosphere {
  constructor(scene, state) {
    this.scene = scene;
    this.state = state;

    this.mistParticles = null;
    this.sporeParticles = null;
    this.geyserParticles = null;
    this.sparkParticles = null;

    this.sparksActive = false;

    this.setupMist();
    this.setupSpores();
    this.setupGeysers();
    this.setupSparks();
  }

  setupMist() {
    // 350 volumetric sulfur mist puffs rising through canyon
    const count = 350;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 380;
      positions[i * 3 + 1] = 50 + Math.random() * 700; // Floor to shelf
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1800;

      velocities[i * 3] = (Math.random() - 0.5) * 4;
      velocities[i * 3 + 1] = 8 + Math.random() * 16; // Updraft
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;

      scales[i] = 40 + Math.random() * 60;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.mistVelocities = velocities;

    // Procedural soft circle sprite for particles
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(230, 210, 160, 0.45)');
    grad.addColorStop(0.5, 'rgba(180, 160, 110, 0.2)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 70,
      map: spriteTex,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.mistParticles = new THREE.Points(geo, mat);
    this.scene.add(this.mistParticles);
  }

  setupSpores() {
    // 600 airborne glittering silica dust particles
    const count = 600;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 440;
      positions[i * 3 + 1] = 50 + Math.random() * 1400; // All the way to High Scarp
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Crisp glittering particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(160, 255, 230, 1.0)');
    grad.addColorStop(0.3, 'rgba(100, 220, 200, 0.6)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const sporeTex = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 4.5,
      map: sporeTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sporeParticles = new THREE.Points(geo, mat);
    this.scene.add(this.sporeParticles);
  }

  setupGeysers() {
    // Floor vent geysers at Sluice-Wharf cauldrons
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // 3 vent locations: [-50, 60, -60], [-50, 60, -15], [-50, 60, 30]
      const ventIdx = i % 3;
      const vz = -60 + ventIdx * 45;
      positions[i * 3] = -50 + (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = 60 + Math.random() * 80;
      positions[i * 3 + 2] = vz + (Math.random() - 0.5) * 8;

      vels[i * 3] = (Math.random() - 0.5) * 6;
      vels[i * 3 + 1] = 25 + Math.random() * 45; // High velocity upward
      vels[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geyserVelocities = vels;

    const mat = new THREE.PointsMaterial({
      size: 14,
      color: 0xffeedd,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.geyserParticles = new THREE.Points(geo, mat);
    this.scene.add(this.geyserParticles);
  }

  setupSparks() {
    // Friction sparks and falling stone dust at Ghrat Bridge (-135, 712, -70)
    const count = 150;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    this.sparkVelocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = -135 + (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = 712 + Math.random() * 4;
      positions[i * 3 + 2] = -70 + (Math.random() - 0.5) * 80;

      this.sparkVelocities[i * 3] = (Math.random() - 0.5) * 20;
      this.sparkVelocities[i * 3 + 1] = -10 - Math.random() * 40; // Falling down
      this.sparkVelocities[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 3,
      color: 0xff8822,
      transparent: true,
      opacity: 0.0, // Invisible until crisis triggered
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkParticles = new THREE.Points(geo, mat);
    this.scene.add(this.sparkParticles);
  }

  triggerCrisisSparks() {
    this.sparksActive = true;
    if (this.sparkParticles) {
      this.sparkParticles.material.opacity = 0.9;
    }
  }

  stopCrisisSparks() {
    this.sparksActive = false;
    if (this.sparkParticles) {
      this.sparkParticles.material.opacity = 0.0;
    }
  }

  update(deltaSec, timeHours) {
    // 1. Update Sulfur Mist
    if (this.mistParticles) {
      const pos = this.mistParticles.geometry.attributes.position.array;
      const count = pos.length / 3;
      const fogFactor = this.state.weather.fogDensity;

      this.mistParticles.material.opacity = 0.15 + fogFactor * 0.4;

      for (let i = 0; i < count; i++) {
        pos[i * 3] += (this.mistVelocities[i * 3] + Math.sin(timeHours * 2 + i) * 1.5) * deltaSec;
        pos[i * 3 + 1] += this.mistVelocities[i * 3 + 1] * deltaSec;
        pos[i * 3 + 2] += (this.mistVelocities[i * 3 + 2] + Math.cos(timeHours * 2 + i) * 1.5) * deltaSec;

        // Reset if rises past 750m
        if (pos[i * 3 + 1] > 750) {
          pos[i * 3 + 1] = 50 + Math.random() * 20;
          pos[i * 3] = (Math.random() - 0.5) * 380;
        }
      }
      this.mistParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 2. Update Silica Spores
    if (this.sporeParticles) {
      const spos = this.sporeParticles.geometry.attributes.position.array;
      const count = spos.length / 3;
      const windSpd = this.state.weather.windSpeed || 15;

      for (let j = 0; j < count; j++) {
        // Drifting with The Scour Updraft
        spos[j * 3 + 1] += (windSpd * 0.4) * deltaSec;
        spos[j * 3] += Math.sin(timeHours * 4 + j) * 4 * deltaSec;

        if (spos[j * 3 + 1] > 1450) {
          spos[j * 3 + 1] = 60;
        }
      }
      this.sporeParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Update Geysers
    if (this.geyserParticles) {
      const gpos = this.geyserParticles.geometry.attributes.position.array;
      const count = gpos.length / 3;

      for (let k = 0; k < count; k++) {
        gpos[k * 3] += this.geyserVelocities[k * 3] * deltaSec;
        gpos[k * 3 + 1] += this.geyserVelocities[k * 3 + 1] * deltaSec;
        gpos[k * 3 + 2] += this.geyserVelocities[k * 3 + 2] * deltaSec;

        if (gpos[k * 3 + 1] > 150) {
          const ventIdx = k % 3;
          const vz = -60 + ventIdx * 45;
          gpos[k * 3] = -50 + (Math.random() - 0.5) * 8;
          gpos[k * 3 + 1] = 60;
          gpos[k * 3 + 2] = vz + (Math.random() - 0.5) * 8;
        }
      }
      this.geyserParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Update Disruption Sparks
    if (this.state.disruptionTriggered && !this.sparksActive) {
      this.triggerCrisisSparks();
    } else if (!this.state.disruptionTriggered && this.sparksActive) {
      this.stopCrisisSparks();
    }

    if (this.sparksActive && this.sparkParticles) {
      const kpos = this.sparkParticles.geometry.attributes.position.array;
      const count = kpos.length / 3;
      for (let m = 0; m < count; m++) {
        kpos[m * 3] += this.sparkVelocities[m * 3] * deltaSec;
        kpos[m * 3 + 1] += this.sparkVelocities[m * 3 + 1] * deltaSec;
        kpos[m * 3 + 2] += this.sparkVelocities[m * 3 + 2] * deltaSec;

        if (kpos[m * 3 + 1] < 500) {
          kpos[m * 3] = -135 + (Math.random() - 0.5) * 20;
          kpos[m * 3 + 1] = 712;
          kpos[m * 3 + 2] = -70 + (Math.random() - 0.5) * 80;
        }
      }
      this.sparkParticles.geometry.attributes.position.needsUpdate = true;
    }
  }
}
