/**
 * Unified Semantic Input Action Bus
 * Satisfies STAB-06, UIUX-41, UIUX-45, UIUX-47, GAME-01, GAME-02, GAME-09
 */
export class InputBus {
  constructor() {
    this.actions = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      crouch: false,
      jump: false,
      interact: false,
      rinse: false,
      toggleCam: false,
      toggleMinimap: false,
      toggleLedger: false,
      toggleBourse: false,
      toggleDossier: false,
      toggleSettings: false,
      triggerCrisis: false,
      photoMode: false,
      escape: false
    };
    this.listeners = new Map();
    this.escapeStack = [];
    this.setupListeners();
  }

  pushEscapeHandler(fn) {
    this.escapeStack.push(fn);
  }

  popEscapeHandler(fn) {
    const idx = this.escapeStack.indexOf(fn);
    if (idx !== -1) this.escapeStack.splice(idx, 1);
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      // Priority Escape closure hierarchy (UIUX-47)
      if (e.key === 'Escape') {
        if (this.escapeStack.length > 0) {
          const handler = this.escapeStack.pop();
          handler();
          e.preventDefault();
          return;
        }
      }

      if (e.repeat) return;
      const act = this.mapKeyCode(e.code);
      if (act) {
        this.actions[act] = true;
        this.emit(act, true);
      }
    });

    window.addEventListener('keyup', (e) => {
      const act = this.mapKeyCode(e.code);
      if (act) {
        this.actions[act] = false;
        this.emit(act, false);
      }
    });
  }

  mapKeyCode(code) {
    switch (code) {
      case 'KeyW': case 'ArrowUp': return 'forward';
      case 'KeyS': case 'ArrowDown': return 'backward';
      case 'KeyA': case 'ArrowLeft': return 'left';
      case 'KeyD': case 'ArrowRight': return 'right';
      case 'ShiftLeft': case 'ShiftRight': return 'sprint';
      case 'KeyC': return 'crouch';
      case 'Space': return 'jump';
      case 'KeyE': return 'interact';
      case 'KeyR': return 'rinse';
      case 'KeyV': return 'toggleCam';
      case 'KeyM': return 'toggleMinimap';
      case 'KeyL': return 'toggleLedger';
      case 'KeyB': return 'toggleBourse';
      case 'KeyN': return 'toggleDossier';
      case 'KeyO': return 'toggleSettings';
      case 'KeyP': return 'photoMode';
      case 'KeyX': return 'triggerCrisis';
      default: return null;
    }
  }

  on(action, fn) {
    if (!this.listeners.has(action)) this.listeners.set(action, []);
    this.listeners.get(action).push(fn);
  }

  emit(action, value) {
    const list = this.listeners.get(action);
    if (list) list.forEach(fn => fn(value));
  }
}
