/**
 * Binaural Audio Engine with Pink Noise
 * Frequencies mapped to brainwave states and colors
 */

export type FrequencyMode = 
  | 'universal'    // 432 Hz - Universal harmony
  | 'dna'          // 528 Hz - DNA repair
  | 'theta'        // 7 Hz - Deep meditation (Pink Noise)
  | 'liberation'   // 396 Hz - Release guilt/fear
  | 'connection'   // 639 Hz - Relationships
  | 'expression'   // 741 Hz - Solutions
  | 'intuition';   // 852 Hz - Spiritual awakening

export interface FrequencyConfig {
  name: string;
  frequency: number;
  beat?: number;
  color: string;
  meaning: string;
  brainwave?: string;
  usePinkNoise?: boolean;
}

export const FREQUENCIES: Record<FrequencyMode, FrequencyConfig> = {
  universal: {
    name: 'Universal',
    frequency: 432,
    beat: 7.83,
    color: '#00d9ff',
    meaning: 'Frecuencia del universo, sintonización natural',
    brainwave: 'Theta',
  },
  dna: {
    name: 'DNA Repair',
    frequency: 528,
    beat: 7.83,
    color: '#4ade80',
    meaning: 'Transformación y reparación de ADN',
    brainwave: 'Theta',
  },
  theta: {
    name: 'Theta Deep',
    frequency: 200,
    beat: 7,
    color: '#b84fff',
    meaning: 'Meditación profunda, introspección, aprendizaje acelerado',
    brainwave: 'Theta (4-8 Hz)',
    usePinkNoise: true,
  },
  liberation: {
    name: 'Liberation',
    frequency: 396,
    beat: 7.83,
    color: '#ef4444',
    meaning: 'Liberación de culpa y miedo, transformación',
    brainwave: 'Theta',
  },
  connection: {
    name: 'Connection',
    frequency: 639,
    beat: 7.83,
    color: '#f97316',
    meaning: 'Conexión y relaciones armoniosas',
    brainwave: 'Alpha',
  },
  expression: {
    name: 'Expression',
    frequency: 741,
    beat: 7.83,
    color: '#eab308',
    meaning: 'Expresión y soluciones, despertar de la intuición',
    brainwave: 'Alpha',
  },
  intuition: {
    name: 'Intuition',
    frequency: 852,
    beat: 7.83,
    color: '#ffd700',
    meaning: 'Despertar espiritual, visión del orden divino',
    brainwave: 'Alpha',
  },
};

export class BinauralAudio {
  private audioContext: AudioContext | null = null;
  private leftOscillator: OscillatorNode | null = null;
  private rightOscillator: OscillatorNode | null = null;
  private leftGain: GainNode | null = null;
  private rightGain: GainNode | null = null;
  private merger: ChannelMergerNode | null = null;
  
  // Pink noise components
  private pinkNoiseNode: AudioBufferSourceNode | null = null;
  private pinkNoiseGain: GainNode | null = null;
  
  private isPlaying = false;
  private currentMode: FrequencyMode | null = null;

  /**
   * Generate Pink Noise buffer
   * 1/f power spectral density
   */
  private generatePinkNoise(duration = 2): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.11; // Adjust volume
        b6 = white * 0.115926;
      }
    }
    
    return buffer;
  }

  start(mode: FrequencyMode = 'universal') {
    if (this.isPlaying) this.stop();

    const config = FREQUENCIES[mode];
    this.currentMode = mode;

    // Create audio context
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillators
    this.leftOscillator = this.audioContext.createOscillator();
    this.rightOscillator = this.audioContext.createOscillator();

    // Create gain nodes
    this.leftGain = this.audioContext.createGain();
    this.rightGain = this.audioContext.createGain();

    // Create channel merger
    this.merger = this.audioContext.createChannelMerger(2);

    // Set frequencies (binaural beat)
    this.leftOscillator.frequency.value = config.frequency;
    this.rightOscillator.frequency.value = config.frequency + (config.beat || 7.83);

    // Set waveform
    this.leftOscillator.type = 'sine';
    this.rightOscillator.type = 'sine';

    // Set volume
    const baseVolume = config.usePinkNoise ? 0.1 : 0.15;
    this.leftGain.gain.value = baseVolume;
    this.rightGain.gain.value = baseVolume;

    // Connect oscillators
    this.leftOscillator.connect(this.leftGain);
    this.rightOscillator.connect(this.rightGain);
    
    this.leftGain.connect(this.merger, 0, 0);
    this.rightGain.connect(this.merger, 0, 1);

    // Add pink noise if configured
    if (config.usePinkNoise) {
      const pinkBuffer = this.generatePinkNoise(2);
      this.pinkNoiseNode = this.audioContext.createBufferSource();
      this.pinkNoiseNode.buffer = pinkBuffer;
      this.pinkNoiseNode.loop = true;
      
      this.pinkNoiseGain = this.audioContext.createGain();
      this.pinkNoiseGain.gain.value = 0.08; // Subtle pink noise layer
      
      this.pinkNoiseNode.connect(this.pinkNoiseGain);
      this.pinkNoiseGain.connect(this.merger, 0, 0);
      this.pinkNoiseGain.connect(this.merger, 0, 1);
      
      this.pinkNoiseNode.start();
    }
    
    this.merger.connect(this.audioContext.destination);

    // Start oscillators
    this.leftOscillator.start();
    this.rightOscillator.start();

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;

    // Fade out
    if (this.leftGain && this.rightGain && this.audioContext) {
      const currentTime = this.audioContext.currentTime;
      this.leftGain.gain.setValueAtTime(this.leftGain.gain.value, currentTime);
      this.rightGain.gain.setValueAtTime(this.rightGain.gain.value, currentTime);
      this.leftGain.gain.linearRampToValueAtTime(0, currentTime + 0.5);
      this.rightGain.gain.linearRampToValueAtTime(0, currentTime + 0.5);
      
      if (this.pinkNoiseGain) {
        this.pinkNoiseGain.gain.setValueAtTime(this.pinkNoiseGain.gain.value, currentTime);
        this.pinkNoiseGain.gain.linearRampToValueAtTime(0, currentTime + 0.5);
      }
    }

    // Stop after fade
    setTimeout(() => {
      this.leftOscillator?.stop();
      this.rightOscillator?.stop();
      this.pinkNoiseNode?.stop();
      this.audioContext?.close();
      
      this.leftOscillator = null;
      this.rightOscillator = null;
      this.leftGain = null;
      this.rightGain = null;
      this.merger = null;
      this.pinkNoiseNode = null;
      this.pinkNoiseGain = null;
      this.audioContext = null;
      this.isPlaying = false;
      this.currentMode = null;
    }, 500);
  }

  getCurrentMode() {
    return this.currentMode;
  }

  getIsPlaying() {
    return this.isPlaying;
  }
}