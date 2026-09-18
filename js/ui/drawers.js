/**
 * Interactive Modals & Slide-out Drawers
 * Satisfies UIUX-21, UIUX-31, UIUX-32, UIUX-35, UIUX-36, UIUX-38
 */
import { AXIOMS } from '../config.js';

export class DrawerManager {
  constructor(state, npcEngine, ledgerEngine, disruptionEngine, soundEngine) {
    this.state = state;
    this.npcs = npcEngine;
    this.ledger = ledgerEngine;
    this.disruption = disruptionEngine;
    this.sound = soundEngine;

    this.activeDrawer = null;
    this.setupTriggers();
  }

  setupTriggers() {
    document.querySelectorAll('[data-drawer-trigger]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-drawer-trigger');
        this.openDrawer(target);
      });
    });

    document.querySelectorAll('[data-drawer-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeDrawer());
    });
  }

  openDrawer(name) {
    this.closeDrawer();
    const el = document.getElementById(`drawer-${name}`);
    if (!el) return;

    this.renderDrawerContent(name);
    el.classList.add('active');
    this.activeDrawer = el;
    if (this.sound) this.sound.playFootstep('wood');
  }

  closeDrawer() {
    if (this.activeDrawer) {
      this.activeDrawer.classList.remove('active');
      this.activeDrawer = null;
    }
  }

  renderDrawerContent(name) {
    if (name === 'ledger') {
      const report = this.ledger.generateAuditReport();
      const container = document.getElementById('ledger-content');
      if (!container) return;

      container.innerHTML = `
        <h3>WORLD STATE LEDGER — TIDE ${report.tideHour}h</h3>
        <p class="ledger-summary">State: <strong>${report.isCrisis ? 'DISRUPTED (GHRAT BRIDGE SHEARED)' : 'NOMINAL BASELINE'}</strong></p>
        
        <h4>Infrastructure Audit</h4>
        <table class="ledger-table">
          <thead><tr><th>Structure</th><th>Baseline State</th><th>Post-Disruption State</th><th>Status</th></tr></thead>
          <tbody>
            ${report.infrastructure.map(i => `
              <tr>
                <td><strong>${i.name}</strong></td>
                <td>${i.pre}</td>
                <td class="${i.status !== 'NOMINAL' && i.status !== 'INTACT' ? 'text-warn' : ''}">${i.post}</td>
                <td><span class="badge ${i.status}">${i.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>Siphon-Bourse Commodity Volatility (In Lek)</h4>
        <table class="ledger-table">
          <thead><tr><th>Commodity</th><th>Baseline Price</th><th>Current Price</th><th>Net Volatility</th></tr></thead>
          <tbody>
            ${report.commodities.map(c => `
              <tr>
                <td>${c.item}</td>
                <td>${c.baseline}</td>
                <td><strong>${c.current}</strong></td>
                <td class="${c.delta !== '0.0%' ? 'text-warn' : ''}">${c.delta}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h4>What Remained Completely Unchanged</h4>
        <ul class="ledger-list">
          ${report.unchangedAxioms.map(a => `<li>${a}</li>`).join('')}
        </ul>
      `;
    } else if (name === 'bourse') {
      const m = this.state.market;
      const container = document.getElementById('bourse-content');
      if (!container) return;

      container.innerHTML = `
        <h3>SIPHON-BOURSE COMMODITY TICKER</h3>
        <p class="bourse-sub">Exchange Rate: 1 Lek = 100ml certified highland snowmelt</p>
        <div class="bourse-grid">
          <div class="bourse-card">
            <h4>Fresh Water (1L)</h4>
            <div class="price">${m.waterLek.toFixed(2)} Lek</div>
            <button class="action-btn" data-buy="waterLek">Buy Liter</button>
          </div>
          <div class="bourse-card">
            <h4>Black-Kelp Flour (50kg)</h4>
            <div class="price">${m.kelpFlour.toFixed(2)} Lek</div>
            <button class="action-btn" data-buy="kelpFlour">Buy 50kg</button>
          </div>
          <div class="bourse-card">
            <h4>Manna-Curd (100g)</h4>
            <div class="price">${m.mannaCurd.toFixed(2)} Lek</div>
            <button class="action-btn" data-buy="mannaCurd">Buy Curd</button>
          </div>
          <div class="bourse-card">
            <h4>Silic-Timber Pins (Box 50)</h4>
            <div class="price">${m.silicPins.toFixed(2)} Lek</div>
            <button class="action-btn" data-buy="silicPins">Buy Pins</button>
          </div>
        </div>
      `;
    } else if (name === 'dossier') {
      const container = document.getElementById('dossier-content');
      if (!container) return;

      container.innerHTML = `
        <h3>INHABITANT CITIZEN DOSSIER (20 RECURRING INHABITANTS)</h3>
        <div class="dossier-grid">
          ${this.npcs.npcs.map(n => `
            <div class="dossier-card">
              <h4>${n.name}</h4>
              <p class="role">${n.role} — <em>${n.tier} Tier</em></p>
              <div class="stat">Health: <span class="badge ${n.health.toLowerCase().replace(/[^a-z]/g,'')}">${n.health}</span></div>
              <div class="stat">Water Scrip: <strong>${n.waterScrip} Lek</strong></div>
              <p class="activity">Current Activity: ${n.currentActivity || 'Routine duties'}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
  }
}
