/**
 * Dual Pulmonary-Metabolic & Vitrification Simulation
 * Satisfies GAME-11, GAME-12, GAME-13, GAME-14, GAME-15, GAME-16, GAME-17, GAME-18, GAME-19, GAME-20, UIUX-02
 */
import { AXIOMS } from '../config.js';

export class BiologyEngine {
  constructor(state, soundEngine) {
    this.state = state;
    this.sound = soundEngine;
    this.wheezeTimer = 0;
  }

  update(deltaSec) {
    const p = this.state.player;
    const env = this.state.weather;

    // Altitude determination
    if (p.y > 1000) {
      p.altitudeZone = 'Scarp';
    } else if (p.y > 400) {
      p.altitudeZone = 'Shelf';
    } else {
      p.altitudeZone = 'Gut';
    }

    // GAME-11: Breathing Plenum fog in Gut or low Shelf
    const inMist = p.y <= this.state.mistHeight;

    if (inMist) {
      // Vitality from fog
      p.hydrationHours = Math.min(12, p.hydrationHours + (deltaSec / 60) * 0.5);

      // GAME-12: Silica encrustation (Vitrification)
      // Accumulates without fresh water rinse
      const factor = p.hasBellowsCowl ? 0.3 : 1.0;
      p.vitrificationPct = Math.min(100, p.vitrificationPct + (deltaSec / 60) * 0.25 * factor);
    } else {
      // On dry Scarp, silica dries out -> Hollow Wasting risk
      p.hydrationHours = Math.max(0, p.hydrationHours - (deltaSec / 60) * 0.1);
      if (p.altitudeZone === 'Scarp' && p.hydrationHours <= 0) {
        p.stamina = Math.max(10, p.stamina - (deltaSec / 60) * 2.0); // Hollow Wasting
      }
    }

    // GAME-18: Wheezing if calcified > 50%
    if (p.vitrificationPct > 50) {
      this.wheezeTimer += deltaSec;
      if (this.wheezeTimer > 10.0) {
        this.wheezeTimer = 0;
        if (this.sound) this.sound.playFootstep('silt');
      }
    }
  }

  // GAME-13: Domestic Rinse Ritual at a fresh water cistern
  performRinse() {
    const p = this.state.player;
    if (p.waterScripLek < 1.0) return false;
    p.waterScripLek -= 1.0;
    p.vitrificationPct = Math.max(0, p.vitrificationPct - 35.0);
    p.hydrationHours = 12.0;
    if (this.sound) this.sound.playValveHiss(1.5);
    return true;
  }

  // GAME-17: Eat Manna-Curd
  consumeMannaCurd() {
    const p = this.state.player;
    p.stamina = 100;
    p.hydrationHours = Math.min(12, p.hydrationHours + 4.0);
  }
}
