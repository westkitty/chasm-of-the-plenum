# Chasm of the Plenum

> An interactive 3D simulation and exploration system of a civilization recursively derived from five foundational physical rules.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/improvements-200%2F200%20verified-success.svg)
![Engine](https://img.shields.io/badge/engine-Three.js%20(offline)-orange.svg)

---

## The Five Foundational Axioms

Everything in this civilization is derived mechanically from five non-negotiable rules:

1. **Environment — The 32-Hour Brine Tide (*The Plenum-Rise*)**: Subterranean brine ocean rises and falls every 32 hours through karst vents, flooding canyon floors to 60m depth with boiling mineral water and pushing dense sulfur-silica mist up to the 700m contour.
2. **Biology — Costal Gill-Cleft & Silica Toxicity**: Inhabitants possess six costal clefts for breathing the mist to absorb vital silicates. Failure to rinse clefts with pure mountain snowmelt within 12 hours causes progressive joint petrification (*Vitrification*).
3. **Resources — Vitreous Silic-Timber & Corrosive Mist**: Flora precipitates internal borosilicate glass fiber skeletons. Metal oxidizes quickly; construction relies on non-corrosive resonant basalt masonry and silic-wood cleaved with 4,200 Hz acoustic tuning forks.
4. **Movement — Gravity Funiculars & Hydro-Gradients**: Lowlands are impassable boiling mud. Horizontal transit relies on tensioned catenary suspension cables; vertical transit relies on hydro-counterweight funiculars driven by highland water ballast.
5. **Social Organization — The Wash-Compact**: Highlanders control fresh meltwater cisterns; lowlanders control food, fuel, and timber harvests. Survival requires a reciprocal barter economy denominated in *Lek* (certified water scrip tokens).

---

## 200 Verified Improvements

The simulation implements **exactly 200 inspectable improvements** across four balanced categories:

- **50 UI / UX Improvements (`UIUX-01` to `UIUX-50`)**: Real-time 32-hour Tide Clock HUD, Costal Vitrification & Hydration gauges, Barometric Altimeter, Chasm Minimap, Live Bourse Ticker, Live World State Ledger drawer, Citizen Dossier (20 inhabitants), Director Photo Mode, and responsive design down to 390px.
- **50 Gameplay Improvements (`GAME-01` to `GAME-50`)**: 1st/3rd person toggle, sprint with stamina drain, costal cleft mist breathing, domestic cistern rinsing, pumice mud-stilts, cliff funicular operation, cable-car crossing, tuning-fork harvesting, and the interactive Ghrat bridge shear crisis.
- **50 Stability & Backend Improvements (`STAB-01` to `STAB-50`)**: Decoupled 60Hz physics loop, clamped delta governor, Vector3 memory pools, WebGL context loss recovery, Web Audio procedural wind/gong synthesizer, LocalStorage schema engine & autosave, catenary cable solver, and Bernoulli hydraulics.
- **50 Simulation & World Improvements (`SIMU-01` to `SIMU-50`)**: 32-hour planetary hydraulic tide (Gush, Steam, Drain, Silt), 60m volumetric brine flood, rising 700m sulfur mist, 20 autonomous inhabitants with 32h schedules, 6-commodity dynamic market elasticity, and Ghrat bridge causal disruption cascade.

See [`IMPROVEMENTS_LEDGER.md`](./IMPROVEMENTS_LEDGER.md) for the full 200-row itemized registry with code call-paths.

---

## Architecture & Quick Start

The simulation is **100% dependency-free and offline-capable**, bundling local Three.js r128 libraries.

### Local Development Server

```bash
python3 tools/serve.py 8080
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

### Automated Test Verification

Run the verification test suite to validate all 200 improvements and simulation mathematics:

```bash
python3 tools/verify_improvements.py
```

---

## Controls

- **Locomotion**: `W` `A` `S` `D` or Arrow Keys
- **Sprint**: Hold `Shift` (consumes stamina)
- **Crouch**: Press `C` (for low flumes)
- **Rinse Pleats**: Press `R` at a cistern (spends 1 Lek to clear vitrification)
- **Camera View**: Press `V` to toggle First-Person / Third-Person / Overview
- **Time Scrubbing**: Click `1x`, `5x`, `30x`, or `120x` to speed up the 32-hour planetary tide
- **The Disruption**: Click **TRIGGER GHRAT BRIDGE SHEAR** (or press `X`) to trigger the tension shackle failure and inspect the causal cascade in the **WORLD STATE LEDGER** drawer
