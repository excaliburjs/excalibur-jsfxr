import { Random } from "excalibur";
import jsfxr from "./sfxr"
type JSFXValueRange = {
  min: number;
  max: number;
};

type JSFXvalue = number | JSFXValueRange;

export type SoundConfig = {
  oldParams: boolean;
  wave_type: JSFXvalue;
  p_env_attack: JSFXvalue;
  p_env_sustain: JSFXvalue;
  p_env_punch: JSFXvalue;
  p_env_decay: JSFXvalue;
  p_base_freq: JSFXvalue;
  p_freq_limit: JSFXvalue;
  p_freq_ramp: JSFXvalue;
  p_freq_dramp: JSFXvalue;
  p_vib_strength: JSFXvalue;
  p_vib_speed: JSFXvalue;
  p_arp_mod: JSFXvalue;
  p_arp_speed: JSFXvalue;
  p_duty: JSFXvalue;
  p_duty_ramp: JSFXvalue;
  p_repeat_speed: JSFXvalue;
  p_pha_offset: JSFXvalue;
  p_pha_ramp: JSFXvalue;
  p_lpf_freq: JSFXvalue;
  p_lpf_ramp: JSFXvalue;
  p_lpf_resonance: JSFXvalue;
  p_hpf_freq: JSFXvalue;
  p_hpf_ramp: JSFXvalue;
  sound_vol: JSFXvalue;
  sample_rate: JSFXvalue;
  sample_size: JSFXvalue;
};

export type SynthDef = Partial<Record<keyof SoundConfig, number>>
export type Wave = unknown & { _brand: "WaveHandle" }; 
export type SoundAlgorithm = any; 

export interface Jsfxr {
  toBuffer(): number[];
  toWebAudio(synthdef: SynthDef, audiocontext: AudioContext): AudioBufferSourceNode;
  toWave(synthdef: SynthDef): Wave;
  toAudio(synthdef: SynthDef): {
    play: () => void;
    setVolume: (n: number) => void;
    channels: AudioBufferSourceNode[];
  }; 
  play(synthdef: SynthDef): void;
  b58decode(b58encoded: string): SynthDef;
  b58encode(synthdef: SynthDef): string;
  generate(algorithm: SoundAlgorithm, options: any): any;
}

export class JsfxrResource {
  sounds: { [key: string]: SoundConfig } = {};
  jsfxr: Jsfxr = jsfxr;

  loadSoundConfig(name: string, config: SoundConfig) {
    this.sounds[name] = config;
  }

  rangeValue(min: number, max: number, random?: Random): number {
    const zeroToOne = random ? random.next() : Math.random();
    return zeroToOne * (max - min) + min;
  }

  deleteSoundConfig(name: string): void {
    delete this.sounds[name];
  }
  playConfig(config: SoundConfig, random?: Random): void {
    const resolvedConfig = this.resolveValues(config, random);
    const a = jsfxr.toAudio(resolvedConfig);
    a.play();
  }

  resolveValues(config: SoundConfig, random?: Random): Partial<Record<keyof SoundConfig, number>>  {
    const newConfig: Partial<Record<keyof SoundConfig, number>> = {};

    for (const key in config) {
      if (key === "oldParams") continue;

      const value = config[key as keyof SoundConfig] as JSFXvalue;

      if (typeof value === "number") {
        newConfig[key as keyof SoundConfig] = value;
      } else {
        const min = value.min;
        const max = value.max;

        newConfig[key as keyof SoundConfig] = this.rangeValue(min, max, random);
      }
    }

    return newConfig;
  }

  playSound(name: string, random?: Random) {

    const config = this.sounds[name];
    if (!config) {
      throw new Error(`Sound ${name} not found`);
    }

    const resolvedConfig = this.resolveValues(config, random);
    const a = this.jsfxr.toAudio(resolvedConfig);
    a.play();
  }

  getConfigs(): { [key: string]: SoundConfig } {
    return this.sounds;
  }
}
