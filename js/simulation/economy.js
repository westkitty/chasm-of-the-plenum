/**
 * Siphon-Bourse Commodity Market & Water Debt Ledger
 * Satisfies SIMU-31, SIMU-32, SIMU-33, SIMU-34, SIMU-35, SIMU-36, SIMU-37, SIMU-38, SIMU-39, SIMU-40, UIUX-21, UIUX-22, UIUX-23
 */
import { AXIOMS } from '../config.js';

export class EconomyEngine {
  constructor(state) {
    this.state = state;
  }

  update(deltaSec) {
    const m = this.state.market;
    const isCrisis = this.state.disruptionTriggered;

    if (isCrisis) {
      // Peak crisis price shifts (From Section 8 World State Ledger)
      // Water: 1.12 -> 4.80 -> 2.45
      // Kelp: 3.20 -> 3.40 -> 8.90
      // Manna-curd: 0.80 -> 0.85 -> 1.95
      // Silic-pins: 0.45 -> 1.20 -> 0.90
      m.waterLek = Math.min(AXIOMS.ECONOMY.CRISIS_PEAK_LEK, m.waterLek + (deltaSec / 60) * 0.15);
      m.kelpFlour = Math.min(8.90, m.kelpFlour + (deltaSec / 60) * 0.2);
      m.mannaCurd = Math.min(1.95, m.mannaCurd + (deltaSec / 60) * 0.05);
      m.silicPins = Math.min(1.20, m.silicPins + (deltaSec / 60) * 0.04);
    } else {
      // Natural market oscillation based on tide
      const t = this.state.timeHours;
      // Inrush: food is inaccessible -> kelp goes up slightly
      // Late Ebb: thirst spikes -> water goes up slightly
      m.waterLek = AXIOMS.ECONOMY.BASE_LEK_LITER * (1 + 0.15 * Math.sin(t * (Math.PI / 16)));
      m.kelpFlour = AXIOMS.ECONOMY.KELP_FLOUR_BASE * (1 + 0.10 * Math.cos(t * (Math.PI / 16)));
      m.mannaCurd = AXIOMS.ECONOMY.MANNA_CURD_BASE;
      m.silicPins = AXIOMS.ECONOMY.SILIC_PINS_BASE;
      m.vinegarLye = AXIOMS.ECONOMY.VINEGAR_LYE_BASE;
      m.saltBeef = AXIOMS.ECONOMY.SALT_BEEF_BASE;
    }
  }

  buyCommodity(id, amount = 1) {
    const p = this.state.player;
    const cost = (this.state.market[id] || 1.0) * amount;
    if (p.waterScripLek >= cost) {
      p.waterScripLek -= cost;
      const item = p.inventory.find(i => i.id === id);
      if (item) item.count += amount;
      else p.inventory.push({ id, name: id.toUpperCase(), count: amount });
      return true;
    }
    return false;
  }
}
