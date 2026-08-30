type Sound = 'coin' | 'jig' | 'pulse' | 'select' | 'gobbler' | 'blast' | 'spew' | 'link' | 'error';
const tones: Record<Sound, [number, number, OscillatorType]> = {
  coin: [880, .09, 'sine'], jig: [220, .5, 'sawtooth'], pulse: [140, .08, 'sine'], select: [520, .12, 'square'], gobbler: [78, .35, 'sawtooth'], blast: [980, .1, 'square'], spew: [110, .65, 'sawtooth'], link: [660, .4, 'triangle'], error: [90, .2, 'square'],
};

class ClueAudio {
  private context?: AudioContext;
  private enabled = true;
  setMuted(muted: boolean) { this.enabled = !muted; }
  unlock() { if (!this.context) this.context = new AudioContext(); void this.context.resume(); }
  play(sound: Sound) {
    if (!this.enabled) return;
    this.unlock();
    const context = this.context!; const [frequency, duration, type] = tones[sound];
    const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.frequency.setValueAtTime(frequency, context.currentTime); oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency / 2), context.currentTime + duration);
    oscillator.type = type; gain.gain.setValueAtTime(.045, context.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination); oscillator.start(); oscillator.stop(context.currentTime + duration);
  }
}
export const clueAudio = new ClueAudio();
