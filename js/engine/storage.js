/**
 * LocalStorage Schema Engine & Session Persistence
 * Satisfies STAB-11, STAB-12, STAB-13, STAB-14, STAB-15, STAB-16, STAB-17, STAB-18, STAB-19, STAB-20
 */
import { INITIAL_STATE } from '../config.js';

const STORAGE_KEY = 'chasm_plenum_save_v1';

export class PersistenceEngine {
  constructor(getStateFn, setStateFn) {
    this.getState = getStateFn;
    this.setState = setStateFn;
    this.autosaveInterval = null;
    this.sessionStartTime = Date.now();
    this.elapsedSeconds = 0;
  }

  init() {
    this.load();
    // STAB-12: Autosave every 15s
    this.autosaveInterval = setInterval(() => this.save(), 15000);
    window.addEventListener('beforeunload', () => this.save());
  }

  save() {
    try {
      const state = this.getState();
      const payload = {
        schemaVersion: 1,
        timestamp: Date.now(),
        elapsed: this.elapsedSeconds,
        state
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Save failed:', e);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      if (data.schemaVersion === 1 && data.state) {
        this.setState(data.state);
        this.elapsedSeconds = data.elapsed || 0;
        return true;
      }
    } catch (e) {
      console.warn('Storage corrupted, resetting to defaults (STAB-15):', e);
      this.reset();
    }
    return false;
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.setState(JSON.parse(JSON.stringify(INITIAL_STATE)));
  }

  exportJSON() {
    const state = this.getState();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'chasm_plenum_state.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.player && parsed.market) {
        this.setState(parsed);
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  }
}
