/**
 * Tactical In-Game HUD Elements
 * Satisfies UIUX-01, UIUX-02, UIUX-03, UIUX-04, UIUX-05, UIUX-06, UIUX-08, UIUX-11, UIUX-13, UIUX-49, UIUX-50
 */
export class HUDManager {
  constructor(state, inputBus) {
    this.state = state;
    this.input = inputBus;
    this.dom = {
      tideHour: document.getElementById('hud-tide-hour'),
      tideStroke: document.getElementById('hud-tide-stroke'),
      tideBar: document.getElementById('hud-tide-bar'),
      vitrificationBar: document.getElementById('hud-vitrification-bar'),
      vitrificationText: document.getElementById('hud-vitrification-text'),
      hydrationBar: document.getElementById('hud-hydration-bar'),
      altitudeText: document.getElementById('hud-altitude-text'),
      altitudeZone: document.getElementById('hud-altitude-zone'),
      windText: document.getElementById('hud-wind-text'),
      windVector: document.getElementById('hud-wind-vector'),
      staminaBar: document.getElementById('hud-stamina-bar'),
      waterScripText: document.getElementById('hud-water-scrip')
    };
  }

  update(stroke) {
    const s = this.state;
    const p = s.player;

    if (this.dom.tideHour) {
      this.dom.tideHour.textContent = `TIDE ${s.timeHours.toFixed(1)}h / 32.0h`;
    }
    if (this.dom.tideStroke) {
      this.dom.tideStroke.textContent = stroke.name.toUpperCase();
    }
    if (this.dom.tideBar) {
      const pct = (s.timeHours / 32) * 100;
      this.dom.tideBar.style.width = `${pct}%`;
    }

    if (this.dom.vitrificationBar) {
      this.dom.vitrificationBar.style.width = `${p.vitrificationPct.toFixed(1)}%`;
      if (p.vitrificationPct > 50) {
        this.dom.vitrificationBar.style.backgroundColor = '#ff3344';
      } else {
        this.dom.vitrificationBar.style.backgroundColor = '#ffaa33';
      }
    }
    if (this.dom.vitrificationText) {
      this.dom.vitrificationText.textContent = `${p.vitrificationPct.toFixed(1)}%`;
    }

    if (this.dom.hydrationBar) {
      const hydPct = (p.hydrationHours / 12) * 100;
      this.dom.hydrationBar.style.width = `${hydPct.toFixed(1)}%`;
    }

    if (this.dom.altitudeText) {
      this.dom.altitudeText.textContent = `${Math.round(p.y)}m`;
    }
    if (this.dom.altitudeZone) {
      this.dom.altitudeZone.textContent = p.altitudeZone.toUpperCase();
    }

    if (this.dom.windText) {
      this.dom.windText.textContent = `${s.weather.windName} (${s.weather.windSpeedMps.toFixed(1)} m/s)`;
    }

    if (this.dom.staminaBar) {
      this.dom.staminaBar.style.width = `${p.stamina.toFixed(0)}%`;
    }

    if (this.dom.waterScripText) {
      this.dom.waterScripText.textContent = `${p.waterScripLek.toFixed(2)} Lek`;
    }
  }
}
