/**
 * Fixed-timestep physics simulation loop & RAF renderer
 * Satisfies STAB-01, STAB-02, STAB-08, STAB-43
 */
export class SimulationLoop {
  constructor(updateFn, renderFn, fixedStepMs = 1000 / 60) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
    this.fixedStep = fixedStepMs / 1000;
    this.accumulator = 0;
    this.lastTime = 0;
    this.isRunning = false;
    this.rafId = null;
    this.spikeCount = 0;
    this.lastSpikeMs = 0;
    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsCalc = 0;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastFpsCalc = this.lastTime;
    const tick = (now) => {
      if (!this.isRunning) return;
      let rawDelta = (now - this.lastTime) / 1000;
      this.lastTime = now;

      // STAB-43: Performance spike detection (>33.3ms)
      if (rawDelta > 0.0333) {
        this.spikeCount++;
        this.lastSpikeMs = rawDelta * 1000;
      }

      // STAB-02: Clamped frame delta governor (max 0.1s to prevent tunneling)
      const clampedDelta = Math.min(rawDelta, 0.1);
      this.accumulator += clampedDelta;

      // STAB-01: Decoupled fixed-timestep physics update (60Hz)
      while (this.accumulator >= this.fixedStep) {
        this.updateFn(this.fixedStep);
        this.accumulator -= this.fixedStep;
      }

      // STAB-08: Render call with interpolation alpha
      const alpha = this.accumulator / this.fixedStep;
      this.renderFn(alpha, rawDelta);

      this.frameCount++;
      if (now - this.lastFpsCalc >= 500) {
        this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsCalc));
        this.frameCount = 0;
        this.lastFpsCalc = now;
      }

      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}
