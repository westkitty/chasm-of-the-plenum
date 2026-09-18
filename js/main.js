/**
 * CHASM OF THE PLENUM - MAIN APPLICATION ENTRY POINT
 * Coordinates all 200 system improvements across UI/UX, Gameplay, Stability, Simulation,
 * and the complete Three.js 3D Virtual Experience.
 */
import { INITIAL_STATE, AXIOMS } from './config.js';
import { SimulationLoop } from './engine/loop.js';
import { InputBus } from './engine/input.js';
import { SoundEngine } from './engine/audio.js';
import { PersistenceEngine } from './engine/storage.js';

import { TideEngine } from './simulation/tide.js';
import { BiologyEngine } from './simulation/biology.js';
import { EconomyEngine } from './simulation/economy.js';
import { NPCEngine } from './simulation/npcs.js';
import { DisruptionEngine } from './simulation/disruption.js';
import { WorldStateLedger } from './simulation/ledger.js';

import { WorldScene } from './world/scene.js';
import { CanyonWorld } from './world/canyon.js';
import { CablewaySystem } from './world/cableways.js';
import { BrineOcean } from './world/water.js';
import { CharacterSystem } from './world/characters.js';
import { ParticleAtmosphere } from './world/particles.js';
import { InteractionSystem } from './world/interact.js';

import { HUDManager } from './ui/hud.js';
import { DrawerManager } from './ui/drawers.js';
import { ToastManager } from './ui/toasts.js';
import { PhotoMode } from './ui/photo.js';

class ChasmSimulationApp {
  constructor() {
    this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
    this.input = new InputBus();
    this.sound = new SoundEngine();
    this.toasts = new ToastManager();

    // Simulation subsystems
    this.tide = new TideEngine(this.state);
    this.biology = new BiologyEngine(this.state, this.sound);
    this.economy = new EconomyEngine(this.state);
    this.npcs = new NPCEngine(this.state);
    this.disruption = new DisruptionEngine(this.state, this.sound, this.toasts);
    this.ledger = new WorldStateLedger(this.state);

    // Persistence
    this.storage = new PersistenceEngine(
      () => this.state,
      (loaded) => { Object.assign(this.state, loaded); }
    );
    this.storage.init();

    // 3D Scene & World
    const viewport = document.getElementById('viewport');
    this.worldScene = new WorldScene(viewport);
    this.canyon = new CanyonWorld(this.worldScene.scene);
    this.cableways = new CablewaySystem(this.worldScene.scene, this.state);
    this.brineOcean = new BrineOcean(this.worldScene.scene, this.state);
    this.particles = new ParticleAtmosphere(this.worldScene.scene, this.state);
    this.characters = new CharacterSystem(this.worldScene.scene, this.state, this.npcs);

    // 3D Raycasting & Holographic Interaction
    this.interact = new InteractionSystem(
      this.worldScene.scene,
      this.worldScene.camera,
      viewport,
      {
        onSelectNPC: (npcId) => {
          this.drawers.openDrawer('dossier');
          this.toasts.add(`Inspecting citizen dossier: ${npcId.toUpperCase()}`, 'info');
        },
        onSelectBourse: () => {
          this.drawers.openDrawer('bourse');
          this.toasts.add('Accessing Siphon-Bourse Commodity Exchange', 'info');
        },
        onSelectCistern: () => {
          const ok = this.biology.performRinse();
          if (ok) {
            this.toasts.add('Pleats rinsed at Great Cistern Rim! Vitrification reduced.', 'success');
          } else {
            this.toasts.add('Insufficient water scrip (1.0 Lek required).', 'error');
          }
        },
        onSelectBridge: () => {
          this.drawers.openDrawer('ledger');
          this.toasts.add('Auditing Hanging Span of Ghrat status in Ledger', 'info');
        }
      }
    );

    // UI
    this.hud = new HUDManager(this.state, this.input);
    this.drawers = new DrawerManager(this.state, this.npcs, this.ledger, this.disruption, this.sound);
    this.photo = new PhotoMode(this.worldScene.renderer, this.worldScene.camera);

    this.headBobTimer = 0;
    this.isPlayerMoving = false;

    this.setupInteractions();
    this.setupTimeControls();
    this.setupCameraNavigationUI();

    // Loop
    this.loop = new SimulationLoop(
      (dt) => this.physicsUpdate(dt),
      (alpha, rawDelta) => this.renderUpdate(alpha, rawDelta)
    );
  }

  setupInteractions() {
    // Rinse action (Key R)
    this.input.on('rinse', () => {
      const ok = this.biology.performRinse();
      if (ok) {
        this.toasts.add('Costal pleats rinsed with 1L fresh snowmelt. Vitrification reduced!', 'success');
      } else {
        this.toasts.add('Insufficient water scrip (requires 1.0 Lek for domestic rinse).', 'error');
      }
    });

    // Camera view toggle (Key V)
    this.input.on('toggleCam', () => {
      if (this.worldScene.viewMode === 'orbit') {
        this.setCameraMode('third_person');
      } else if (this.worldScene.viewMode === 'third_person') {
        this.setCameraMode('first_person');
      } else {
        this.setCameraMode('orbit');
      }
    });

    this.input.on('camOrbit', () => this.setCameraMode('orbit'));
    this.input.on('camThird', () => this.setCameraMode('third_person'));
    this.input.on('camFirst', () => this.setCameraMode('first_person'));

    // Crisis trigger (Key X or Button)
    this.input.on('triggerCrisis', () => {
      this.disruption.triggerShackleShear();
    });

    const crisisBtn = document.getElementById('btn-trigger-crisis');
    if (crisisBtn) {
      crisisBtn.addEventListener('click', () => {
        if (!this.state.disruptionTriggered) {
          this.disruption.triggerShackleShear();
          crisisBtn.textContent = 'RESOLVE CRISIS';
          crisisBtn.classList.add('btn-danger');
        } else {
          this.disruption.resolveCrisis();
          crisisBtn.textContent = 'TRIGGER GHRAT BRIDGE SHEAR';
          crisisBtn.classList.remove('btn-danger');
        }
      });
    }

    // Photo mode (Key P)
    this.input.on('photoMode', () => {
      this.photo.toggle();
    });

    // Drawers shortcuts
    this.input.on('toggleLedger', () => this.drawers.openDrawer('ledger'));
    this.input.on('toggleBourse', () => this.drawers.openDrawer('bourse'));
    this.input.on('toggleDossier', () => this.drawers.openDrawer('dossier'));

    // Sound unlock on first click
    window.addEventListener('click', () => {
      this.sound.ensureContext();
    }, { once: true });

    // UIUX-50: Copy coordinates
    const copyCoordsBtn = document.getElementById('btn-copy-coords');
    if (copyCoordsBtn) {
      copyCoordsBtn.addEventListener('click', () => {
        const p = this.state.player;
        const text = `Position: X=${p.x.toFixed(1)}, Y=${p.y.toFixed(1)}m (${p.altitudeZone}), Z=${p.z.toFixed(1)} | Tide=${this.state.timeHours.toFixed(1)}h`;
        navigator.clipboard.writeText(text).then(() => {
          this.toasts.add('Coordinates copied to clipboard!', 'info');
        });
      });
    }

    // UIUX-49: Contextual cursor state
    window.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-grabbing');
    });
    window.addEventListener('mouseup', () => {
      document.body.classList.remove('cursor-grabbing');
    });
  }

  setupCameraNavigationUI() {
    // Mode buttons
    document.querySelectorAll('[data-cam-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-cam-mode');
        this.setCameraMode(mode);
      });
    });

    // Fly-to landmark buttons
    document.querySelectorAll('[data-fly-to]').forEach(btn => {
      btn.addEventListener('click', () => {
        const landmark = btn.getAttribute('data-fly-to');
        this.flyToLandmark(landmark);
      });
    });
  }

  setCameraMode(mode) {
    this.worldScene.viewMode = mode;
    document.querySelectorAll('[data-cam-mode]').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cam-mode') === mode);
    });

    if (mode === 'orbit') {
      this.toasts.add('Camera: Free Orbit Drone (Left-click drag to rotate, Right-click pan, Scroll zoom)', 'info', 4000);
    } else if (mode === 'third_person') {
      this.toasts.add('Camera: Third-Person Scavenger Chase', 'info');
    } else if (mode === 'first_person') {
      this.toasts.add('Camera: First-Person Explorer View', 'info');
    }
  }

  flyToLandmark(landmark) {
    if (landmark === 'cistern') {
      this.worldScene.flyTo(new THREE.Vector3(-150, 1470, -40), new THREE.Vector3(-150, 1415, -120), 2.0);
      this.toasts.add('Flying to High Scarp: The Great Cistern (1,400m)', 'info');
    } else if (landmark === 'bourse') {
      this.worldScene.flyTo(new THREE.Vector3(-90, 750, 140), new THREE.Vector3(-145, 725, 80), 2.0);
      this.toasts.add('Flying to Median Shelf: Siphon-Bourse Arcade (710m)', 'info');
    } else if (landmark === 'bridge') {
      this.worldScene.flyTo(new THREE.Vector3(-90, 740, -70), new THREE.Vector3(-135, 712, -70), 2.0);
      this.toasts.add('Flying to The Hanging Span of Ghrat (712m)', 'info');
    } else if (landmark === 'wharf') {
      this.worldScene.flyTo(new THREE.Vector3(0, 110, 0), new THREE.Vector3(-80, 54, 0), 2.0);
      this.toasts.add('Flying to Low Gut: Sluice-Wharf Nine (50m floor)', 'info');
    } else if (landmark === 'forest') {
      this.worldScene.flyTo(new THREE.Vector3(120, 100, -120), new THREE.Vector3(80, 70, -160), 2.0);
      this.toasts.add('Flying to Vitreous Reach: Silic-Cane Glass Forest', 'info');
    }
  }

  setupTimeControls() {
    document.querySelectorAll('[data-speed]').forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = parseFloat(btn.getAttribute('data-speed'));
        this.state.timeSpeed = spd;
        document.querySelectorAll('[data-speed]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.toasts.add(`Simulation speed set to ${spd}x`, 'info');
      });
    });

    const playPauseBtn = document.getElementById('btn-play-pause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.state.isPaused = !this.state.isPaused;
        playPauseBtn.textContent = this.state.isPaused ? '▶ PLAY' : '⏸ PAUSE';
      });
    }
  }

  physicsUpdate(dt) {
    // 1. Planetary tide cycle
    this.tide.update(dt);

    // 2. Biology & Vitrification
    this.biology.update(dt);

    // 3. Economy & Commodity prices
    this.economy.update(dt);

    // 4. Autonomous NPC routines
    this.npcs.update(dt);

    // 5. Cableways & Funicular motion
    this.cableways.update(dt);

    // 6. Brine Ocean height & waves
    this.brineOcean.update(dt);

    // 7. Player locomotion
    this.updatePlayerMovement(dt);

    // 8. Sound updates
    if (this.sound) {
      this.sound.setPlenumFogDensity(this.state.weather.fogDensity);
    }
  }

  updatePlayerMovement(dt) {
    const act = this.input.actions;
    const p = this.state.player;
    let speed = 15.0; // m/s

    if (act.sprint && p.stamina > 5) {
      speed = 30.0;
      p.stamina = Math.max(0, p.stamina - dt * 15.0);
    } else {
      p.stamina = Math.min(100, p.stamina + dt * 10.0);
    }

    if (act.crouch) {
      speed = 7.0;
    }

    let isMoving = false;
    let dx = 0;
    let dz = 0;

    if (act.forward) { dz -= 1; isMoving = true; }
    if (act.backward) { dz += 1; isMoving = true; }
    if (act.left) { dx -= 1; isMoving = true; }
    if (act.right) { dx += 1; isMoving = true; }

    this.isPlayerMoving = isMoving;

    if (isMoving) {
      const len = Math.hypot(dx, dz);
      p.x += (dx / len) * speed * dt;
      p.z += (dz / len) * speed * dt;

      // Bound player within canyon
      p.x = Math.max(-230, Math.min(230, p.x));
      p.z = Math.max(-1000, Math.min(1000, p.z));

      // Footsteps
      this.headBobTimer += dt * (speed > 20 ? 14 : 8);
      if (Math.sin(this.headBobTimer) > 0.95) {
        let surface = 'basalt';
        if (p.altitudeZone === 'Gut') surface = 'silt';
        if (p.x < -160 && p.y > 690) surface = 'wood';
        if (this.sound) this.sound.playFootstep(surface);
      }
    }

    // Altitude stairs navigation
    if (p.x < -200 && p.z > -100 && p.z < 100) {
      p.y = 710;
    }
  }

  renderUpdate(alpha, rawDelta) {
    const dt = rawDelta || 0.016;
    const p = this.state.player;
    const playerVec = new THREE.Vector3(p.x, p.y, p.z);
    const headBob = Math.sin(this.headBobTimer) * 0.12;

    // 1. Update 3D World Animation (Canyon, Windmills, Waterfalls)
    this.canyon.update(dt);

    // 2. Update Volumetric Particles (Mist, Spores, Geysers, Sparks)
    this.particles.update(dt, this.state.timeHours);

    // 3. Update 3D Characters (Player Avatar, 20 Citizens)
    this.characters.update(dt, this.isPlayerMoving);

    // 4. Update 3D Camera Rig & Celestial Atmosphere
    this.worldScene.updateCamera(playerVec, this.isPlayerMoving, headBob, dt);
    this.worldScene.updateAtmosphere(this.state.timeHours, this.state.weather);

    // 5. Update 3D Interactive Raycasting
    this.interact.update();

    // 6. Render WebGL Scene
    this.worldScene.renderer.render(this.worldScene.scene, this.worldScene.camera);

    // 7. Update HUD
    const stroke = this.tide.getCurrentStroke();
    this.hud.update(stroke);
  }

  start() {
    this.loop.start();
    this.toasts.add('Chasm of the Plenum 3D Experience Active. Click & drag to orbit, or select a camera view.', 'info', 6000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new ChasmSimulationApp();
  app.start();
  window.__chasm_app = app; // Expose for testing
});
