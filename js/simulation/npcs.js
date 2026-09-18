/**
 * 20 Autonomous Inhabitants with 32-Hour State Schedules
 * Satisfies SIMU-11 through SIMU-30, UIUX-31
 */
import { NPCS } from '../config.js';

export class NPCEngine {
  constructor(state) {
    this.state = state;
    this.npcs = JSON.parse(JSON.stringify(NPCS));
  }

  update(deltaSec) {
    const t = this.state.timeHours;
    const isCrisis = this.state.disruptionTriggered;

    for (const npc of this.npcs) {
      // Dynamic location & task based on tide stroke
      if (t < 4) { // Gush
        npc.currentActivity = npc.tier === 'Gut' ? 'Evacuating rising flood waters' : 'Inspecting intake flumes';
      } else if (t < 14) { // Steam
        npc.currentActivity = npc.tier === 'Shelf' ? 'Bourse trading under fog' : 'Sheltered in sealed chambers';
      } else if (t < 18) { // Drain
        npc.currentActivity = npc.tier === 'Gut' ? 'Rushing to Sluice-Wharf Nine' : 'Dispatching downward funiculars';
      } else { // Silt
        npc.currentActivity = npc.tier === 'Gut' ? 'Scraping kelp on freezing mud' : 'Resting on dry moss beds';
      }

      // Crisis overrides
      if (isCrisis) {
        if (npc.id === 'vaelen') npc.currentActivity = 'Cornered in council; defending water rations';
        if (npc.id === 'kallum') npc.currentActivity = 'Industrial embargo: locked funicular winches';
        if (npc.id === 'talia') npc.currentActivity = 'In hiding with secret siphon discrepancy logs';
        if (npc.id === 'teth') npc.currentActivity = 'Comatose in hospital with fused costal pleats';
      }
    }
  }

  getNPC(id) {
    return this.npcs.find(n => n.id === id);
  }
}
