/**
 * CHASM OF THE PLENUM - MAIN APPLICATION ENTRY POINT
 * Coordinates all 200 system improvements across UI/UX, Gameplay, Stability, and Simulation.
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

    // 3D Scene
    const viewport = document.getElementById('viewport');
    this.worldScene = new WorldScene(viewport);
    this.canyon = new CanyonWorld(this.worldScene.scene);
    this.cableways = new CablewaySystem(this.worldScene.scene, this.state);
    this.brineOcean = new BrineOcean(this.worldScene.scene, this.state);

    // UI
    this.hud = new HUDManager(this.state, this.input);
    this.drawers = new DrawerManager(this.state, this.npcs, this.ledger, this.disruption, this.sound);
    this.photo = new PhotoMode(this.worldScene.renderer, this.worldScene.camera);

    this.headBobTimer = 0;
    this.setupInteractions();
    this.setupTimeControls();

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
      if (this.worldScene.viewMode === 'third_person') {
        this.worldScene.viewMode = 'first_person';
        this.toasts.add('Camera: First-Person View', 'info');
      } else if (this.worldScene.viewMode === 'first_person') {
        this.worldScene.viewMode = 'overview';
        this.toasts.add('Camera: Tactical Overview View', 'info');
      } else {
        this.worldScene.viewMode = 'third_person';
        this.toasts.add('Camera: Third-Person View', 'info');
      }
    });

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

    // 6. Brine Ocean height
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
      // Near funicular cliff shelf
      p.y = 710;
    }
  }

  renderUpdate(alpha, rawDelta) {
    const p = this.state.player;
    const playerVec = new THREE.Vector3(p.x, p.y, p.z);
    const headBob = Math.sin(this.headBobTimer) * 0.12;

    this.worldScene.updateCamera(playerVec, false, headBob);
    this.worldScene.setFogDensity(this.state.weather.fogDensity);
    this.worldScene.renderer.render(this.worldScene.scene, this.worldScene.camera);

    // Update HUD
    const stroke = this.tide.getCurrentStroke();
    this.hud.update(stroke);
  }

  start() {
    this.loop.start();
    this.toasts.add('Welcome to the Chasm of the Plenum. 32-hour simulation active.', 'info', 5000);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new ChasmSimulationApp();
  app.start();
  window.__chasm_app = app; // Expose for testing
});
