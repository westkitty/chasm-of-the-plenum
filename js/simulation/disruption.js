/**
 * The Sheared Shackle Causal Disruption Engine
 * Satisfies GAME-41 through GAME-50, SIMU-41 through SIMU-50, UIUX-40
 */
export class DisruptionEngine {
  constructor(state, soundEngine, toastManager) {
    this.state = state;
    this.sound = soundEngine;
    this.toasts = toastManager;
  }

  // GAME-41: Shearing the Northeast tension shackle of the Hanging Span of Ghrat
  triggerShackleShear() {
    if (this.state.disruptionTriggered) return;

    this.state.disruptionTriggered = true;
    this.state.disruptionHour = this.state.timeHours;

    const infra = this.state.infrastructure;
    infra.ghratBridge.state = 'canted_unusable';
    infra.ghratBridge.cantDeg = 25;
    infra.ghratBridge.unstrandedPct = 18;

    // Cascade 1: Hoist #6 overloaded
    infra.hoistSix.state = 'jammed';
    infra.hoistSix.loadPct = 340;

    // Cascade 2: Sewer blowout
    infra.sewerFlue12B.state = 'blown_out';
    infra.sewerFlue12B.floodedLiters = 15000;

    if (this.sound) {
      this.sound.playKlaxon();
      this.sound.playBasaltChime(95); // Deep distress chime
    }

    if (this.toasts) {
      this.toasts.add('CRITICAL: Hanging Span of Ghrat northeast shackle sheared!', 'error');
      this.toasts.add('CASCADE: Auxiliary Hoist #6 guide-pulley jammed under 340% load!', 'warning');
      this.toasts.add('BOURSE SHOCK: Highland water token prices spiking rapidly!', 'warning');
      this.toasts.add('RETALIATION: Bailiff Kallum halts all lowland kelp funiculars!', 'error');
    }
  }

  resolveCrisis() {
    this.state.disruptionTriggered = false;
    const infra = this.state.infrastructure;
    infra.ghratBridge.state = 'repaired';
    infra.ghratBridge.cantDeg = 0;
    infra.hoistSix.state = 'operational';
    infra.hoistSix.loadPct = 50;
    infra.sewerFlue12B.state = 'sealed';

    if (this.toasts) {
      this.toasts.add('REPAIRED: Sheave brotherhood spliced bridge cables; market stabilizing.', 'success');
    }
  }
}
