export type SoundConfig = {
  oldParams: boolean;
  wave_type: number;
  p_env_attack: number;
  p_env_sustain: number;
  p_env_punch: number;
  p_env_decay: number;
  p_base_freq: number;
  p_freq_limit: number;
  p_freq_ramp: number;
  p_freq_dramp: number;
  p_vib_strength: number;
  p_vib_speed: number;
  p_arp_mod: number;
  p_arp_speed: number;
  p_duty: number;
  p_duty_ramp: number;
  p_repeat_speed: number;
  p_pha_offset: number;
  p_pha_ramp: number;
  p_lpf_freq: number;
  p_lpf_ramp: number;
  p_lpf_resonance: number;
  p_hpf_freq: number;
  p_hpf_ramp: number;
  sound_vol: number;
  sample_rate: number;
  sample_size: number;
};

export default class JsfxrResource {
  sounds: { [key: string]: SoundConfig } = {};
  jsfxrModule: any;
  jsfxr: any;

  async init() {
    // @ts-ignore
    this.jsfxrModule = await import("./sfxr.mjs");
    this.jsfxr = this.jsfxrModule.default;
  }

  loadSoundConfig(name: string, config: SoundConfig) {
    this.sounds[name] = config;
  }

  deleteSoundConfig(name: string) {
    delete this.sounds[name];
  }
  playConfig(config: SoundConfig) {
    if (this.jsfxr === undefined) return;
    if (this.jsfxrModule === undefined) return;
    const a = this.jsfxr.toAudio(config);
    a.play();
  }

  playSound(name: string) {
    if (this.jsfxr === undefined) return;
    if (this.jsfxrModule === undefined) return;

    const config = this.sounds[name];
    if (!config) {
      throw new Error(`Sound ${name} not found`);
    }

    const a = this.jsfxr.toAudio(config);
    a.play();
  }

  getConfigs(): { [key: string]: SoundConfig } {
    return this.sounds;
  }
}
