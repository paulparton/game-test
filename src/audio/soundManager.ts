/**
 * Sound Manager - Web Audio API based sound effects and music
 */

interface Note {
  freq: number;
  duration: number; // ms
  delay?: number;
}

export class SoundManager {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private musicOscillator: OscillatorNode | null = null;
  private musicGain: GainNode;

  constructor() {
    // Create audio context
    const audioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new audioContextClass() as AudioContext;
    
    // Create master gain
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    // Create music gain (separate for MX control)
    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.2;
    this.musicGain.connect(this.masterGain);
  }

  playTone(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    return new Promise((resolve) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = type;
      osc.frequency.value = frequency;

      gain.connect(this.masterGain);
      osc.connect(gain);

      // Envelope
      gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration / 1000);

      osc.start(this.audioContext.currentTime);
      osc.stop(this.audioContext.currentTime + duration / 1000);

      setTimeout(resolve, duration);
    });
  }

  // Match clear sound - ascending tones
  playMatchClear(): void {
    const notes: Note[] = [
      { freq: 523.25, duration: 100 }, // C5
      { freq: 659.25, duration: 100 }, // E5
      { freq: 783.99, duration: 150 }, // G5
    ];

    let totalDelay = 0;
    notes.forEach((note) => {
      setTimeout(() => this.playTone(note.freq, note.duration, 'triangle'), totalDelay);
      totalDelay += note.duration;
    });
  }

  // Piece lock sound - simple bell-like tone
  playPieceLock(): void {
    this.playTone(440, 80, 'sine'); // A4
  }

  // Rotate sound - short beep
  playRotate(): void {
    this.playTone(800, 50, 'square');
  }

  // Move sound - subtle beep
  playMove(): void {
    this.playTone(600, 30, 'sine');
  }

  // Game over sound - descending tones
  playGameOver(): void {
    const notes: Note[] = [
      { freq: 523.25, duration: 150 }, // C5
      { freq: 440, duration: 150 },    // A4
      { freq: 349.23, duration: 150 }, // F4
      { freq: 261.63, duration: 200 }, // C4
    ];

    let totalDelay = 0;
    notes.forEach((note) => {
      setTimeout(() => this.playTone(note.freq, note.duration, 'sine'), totalDelay);
      totalDelay += note.duration;
    });
  }

  // Start background music - upbeat Puyo-like tune
  startBackgroundMusic(): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const playMelody = () => {
      const melody: Note[] = [
        { freq: 523.25, duration: 200 }, // C5
        { freq: 587.33, duration: 200 }, // D5
        { freq: 659.25, duration: 200 }, // E5
        { freq: 587.33, duration: 200 }, // D5
        { freq: 523.25, duration: 200 }, // C5
        { freq: 440, duration: 200 },    // A4
        { freq: 493.88, duration: 200 }, // B4
        { freq: 523.25, duration: 400 }, // C5
        
        { freq: 523.25, duration: 150 }, // C5
        { freq: 659.25, duration: 150 }, // E5
        { freq: 783.99, duration: 300 }, // G5
        { freq: 659.25, duration: 150 }, // E5
        { freq: 587.33, duration: 150 }, // D5
        { freq: 523.25, duration: 300 }, // C5
      ];

      let totalDelay = 0;
      melody.forEach((note) => {
        setTimeout(() => {
          this.playTone(note.freq, note.duration * 0.9, 'sine');
        }, totalDelay);
        totalDelay += note.duration;
      });

      // Loop the melody
      setTimeout(playMelody, totalDelay);
    };

    playMelody();
  }

  stopBackgroundMusic(): void {
    if (this.musicOscillator) {
      this.musicOscillator.stop();
      this.musicOscillator = null;
    }
  }

  setMasterVolume(value: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, value));
  }

  setMusicVolume(value: number): void {
    this.musicGain.gain.value = Math.max(0, Math.min(1, value));
  }
}

export const soundManager = new SoundManager();
