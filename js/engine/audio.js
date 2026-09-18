/**
 * Procedural Web Audio API Synthesizer & Spatial Mixer
 * Satisfies STAB-21, STAB-22, STAB-23, STAB-24, STAB-25, STAB-26, STAB-27, STAB-28, STAB-29, STAB-30
 */
export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.masterGain = null;
    this.ambienceGain = null;
    this.sfxGain = null;
    this.uiGain = null;
    this.lowpassFilter = null;
    this.windNode = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // STAB-26: Category Gain buses
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);

      // STAB-22: Dynamic lowpass filter for Plenum fog
      this.lowpassFilter = this.ctx.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.value = 8000;
      this.lowpassFilter.connect(this.masterGain);

      this.ambienceGain = this.ctx.createGain();
      this.ambienceGain.gain.value = 0.6;
      this.ambienceGain.connect(this.lowpassFilter);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.uiGain = this.ctx.createGain();
      this.uiGain.gain.value = 0.5;
      this.uiGain.connect(this.masterGain);

      // STAB-27: Auto suspend on tab background
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          if (this.ctx.state === 'running') this.ctx.suspend();
        } else {
          if (this.ctx.state === 'suspended') this.ctx.resume();
        }
      });

      this.startAmbientWind();
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization deferred:', e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // STAB-21: Procedural wind noise
  startAmbientWind() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 350;
    windFilter.Q.value = 3.0;

    whiteNoise.connect(windFilter);
    windFilter.connect(this.ambienceGain);
    whiteNoise.start();
    this.windNode = windFilter;
  }

  setPlenumFogDensity(density) {
    if (!this.lowpassFilter) return;
    // As fog rises (0 to 1), cutoff drops from 8000Hz down to 600Hz (muffled)
    const freq = Math.max(600, 8000 * (1 - density * 0.85));
    this.lowpassFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.5);
  }

  // STAB-23: Physical basalt chime synthesis
  playBasaltChime(freq = 180) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.76, now); // Metallic overtone

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 3.6);
    osc2.stop(now + 3.6);
  }

  // STAB-28: Footstep generator
  playFootstep(surface = 'basalt') {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    let pitch = 80;
    if (surface === 'wood') pitch = 140;
    if (surface === 'silt') pitch = 60;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // STAB-30: Crisis warning klaxon
  playKlaxon() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.4);
    osc.frequency.linearRampToValueAtTime(300, now + 0.8);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.uiGain);
    osc.start(now);
    osc.stop(now + 1.25);
  }

  // STAB-24: Hydrostatic fluid hiss
  playValveHiss(durationSec = 1.0) {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + durationSec);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durationSec);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }
}
