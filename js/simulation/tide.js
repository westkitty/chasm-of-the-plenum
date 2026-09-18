/**
 * 32-Hour Subterranean Brine Tide & Thermal Weather Bellows
 * Satisfies SIMU-01, SIMU-02, SIMU-03, SIMU-04, SIMU-05, SIMU-06, SIMU-07, SIMU-08, SIMU-09, SIMU-10, UIUX-01, UIUX-04, UIUX-06
 */
import { AXIOMS, TIDE_STROKES } from '../config.js';

export class TideEngine {
  constructor(state) {
    this.state = state;
  }

  update(deltaSec) {
    if (this.state.isPaused) return;

    // Advance time (deltaSec scaled by timeSpeed, converted to 32h day)
    const hoursPerSec = (1 / 3600) * this.state.timeSpeed;
    this.state.timeHours = (this.state.timeHours + deltaSec * hoursPerSec) % AXIOMS.ENVIRONMENT.TIDE_HOURS;

    const t = this.state.timeHours;

    // SIMU-01 & SIMU-02: Brine water level (0m to 60m)
    // Inrush: 0 to 14h -> rises from 0m to 60m
    // Ebb: 14 to 28h -> falls from 60m to 0m
    // Slack: 28 to 32h -> remains at 0m
    let floodDepth = 0;
    if (t < 14) {
      floodDepth = (t / 14) * AXIOMS.ENVIRONMENT.MAX_FLOOD_DEPTH_M;
    } else if (t < 28) {
      floodDepth = (1 - (t - 14) / 14) * AXIOMS.ENVIRONMENT.MAX_FLOOD_DEPTH_M;
    } else {
      floodDepth = 0;
    }
    this.state.floodDepth = floodDepth;

    // SIMU-03: Volumetric Plenum mist ascent (climbs to 700m contour)
    let mistHeight = 0;
    let fogDensity = 0;
    if (t < 14) {
      mistHeight = 100 + (t / 14) * 600; // climbs to 700m
      fogDensity = 0.2 + (t / 14) * 0.7; // climbs to 0.9
    } else if (t < 28) {
      mistHeight = 700 - ((t - 14) / 14) * 600; // sinks back to 100m
      fogDensity = 0.9 - ((t - 14) / 14) * 0.7;
    } else {
      mistHeight = 100;
      fogDensity = 0.15;
    }
    this.state.mistHeight = mistHeight;
    this.state.weather.fogDensity = fogDensity;

    // SIMU-05 & SIMU-06: Wind dynamics (The Scour vs Throat-Sink)
    if (t < 14) {
      this.state.weather.windName = 'The Scour Updraft';
      this.state.weather.windSpeedMps = 15.0 + Math.sin(t * 0.5) * 5.0;
    } else if (t < 28) {
      this.state.weather.windName = 'The Throat-Sink Downdraft';
      this.state.weather.windSpeedMps = 20.0 + Math.cos(t * 0.5) * 8.0;
    } else {
      this.state.weather.windName = 'Calm Highland Breeze';
      this.state.weather.windSpeedMps = 5.0;
    }

    // SIMU-04: Thermal profile
    if (t < 14) {
      this.state.weather.ambientTempC = 35.0 + (t / 14) * 7.0; // 35°C to 42°C in mist
    } else {
      this.state.weather.ambientTempC = 12.0 - ((t - 14) / 18) * 20.0; // drops to -8°C
    }
  }

  getCurrentStroke() {
    const t = this.state.timeHours;
    for (const stroke of TIDE_STROKES) {
      if (t >= stroke.startHour && t < stroke.endHour) {
        return stroke;
      }
    }
    return TIDE_STROKES[0];
  }

  getTideProgressFraction() {
    return this.state.timeHours / AXIOMS.ENVIRONMENT.TIDE_HOURS;
  }
}
