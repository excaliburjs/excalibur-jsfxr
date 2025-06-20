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

type SoundConfigKeys = keyof SoundConfig;

export class JsfxrResource {
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

  rangeValue(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  deleteSoundConfig(name: string) {
    delete this.sounds[name];
  }
  playConfig(config: SoundConfig) {
    if (this.jsfxr === undefined) return;
    if (this.jsfxrModule === undefined) return;
    const resolvedConfig = this.resolveValues(config);
    const a = this.jsfxr.toAudio(resolvedConfig);
    a.play();
  }

  resolveValues(config: SoundConfig) {
    const newConfig: Partial<Record<keyof SoundConfig, number>> = {};

    for (const key in config) {
      if (key === "oldParams") continue;

      const value = config[key as keyof SoundConfig] as JSFXvalue;

      if (typeof value === "number") {
        newConfig[key as keyof SoundConfig] = value;
      } else {
        const min = value.min;
        const max = value.max;

        newConfig[key as keyof SoundConfig] = this.rangeValue(min, max);
        console.log("set ", key, " to ", newConfig[key as keyof SoundConfig], " from ", min, " to ", max);
      }
    }

    return newConfig;
  }

  playSound(name: string) {
    if (this.jsfxr === undefined) return;
    if (this.jsfxrModule === undefined) return;

    const config = this.sounds[name];
    if (!config) {
      throw new Error(`Sound ${name} not found`);
    }

    const resolvedConfig = this.resolveValues(config);
    const a = this.jsfxr.toAudio(resolvedConfig);
    a.play();
  }

  getConfigs(): { [key: string]: SoundConfig } {
    return this.sounds;
  }
}
