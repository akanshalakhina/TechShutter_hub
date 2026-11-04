/* ========================================================
   TECH SHUTTER HUB - Procedural Web Audio Sound Engine
   Generates authentic camera shutter & mechanical lens sounds
   ======================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('tsh_sound_muted') === 'true';
    this.initUserGesture();
  }

  initUserGesture() {
    const unlock = () => {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(e => {
      window.addEventListener(e, unlock, { once: true, passive: true });
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('tsh_sound_muted', this.muted);
    return this.muted;
  }

  // Camera mechanical shutter click (double blade actuation)
  shutterClick() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // 1. First blade click
      this._bladePulse(now, 1600, 0.02, 0.12);
      // 2. Second blade click (after 45ms)
      this._bladePulse(now + 0.045, 1100, 0.025, 0.09);
      // 3. Mirror dampening thud
      this._thud(now + 0.015, 120, 0.05, 0.08);
    } catch (e) {}
  }

  // Soft aperture ring detent tick
  apertureTick() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this._bladePulse(now, 2400, 0.012, 0.06);
    } catch (e) {}
  }

  // Whoosh sound during rapid rotation
  whoosh(speed = 1) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(750, now + 0.06);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      filter.Q.value = 2.5;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(Math.min(0.04 * speed, 0.08), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch (e) {}
  }

  _bladePulse(time, freq, dur, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(140, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
  }

  _thud(time, freq, dur, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + dur);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
  }
}

window.soundEngine = new SoundEngine();
