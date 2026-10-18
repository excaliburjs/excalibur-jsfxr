import type { SoundConfig } from '@excaliburjs/plugin-jsfxr';

/**
 * Every jsfxr parameter, at its neutral value. Individual sounds below only spell out the
 * parameters they actually change, which keeps the interesting bits readable.
 */
const NEUTRAL: SoundConfig = {
  oldParams: true,
  wave_type: 0,
  p_env_attack: 0,
  p_env_sustain: 0.3,
  p_env_punch: 0,
  p_env_decay: 0.4,
  p_base_freq: 0.3,
  p_freq_limit: 0,
  p_freq_ramp: 0,
  p_freq_dramp: 0,
  p_vib_strength: 0,
  p_vib_speed: 0,
  p_arp_mod: 0,
  p_arp_speed: 0,
  p_duty: 0,
  p_duty_ramp: 0,
  p_repeat_speed: 0,
  p_pha_offset: 0,
  p_pha_ramp: 0,
  p_lpf_freq: 1,
  p_lpf_ramp: 0,
  p_lpf_resonance: 0,
  p_hpf_freq: 0,
  p_hpf_ramp: 0,
  sound_vol: 0.25,
  sample_rate: 44100,
  sample_size: 16
};

/**
 * Fixed-value configs exercise the plain generation path; `randomLaser` uses value ranges,
 * which routes through JsfxrResource.rangeValue()/Math.random - see seeded-random.ts for how
 * the example keeps that reproducible.
 */
export const sounds: { [key: string]: SoundConfig } = {
  // sawtooth blip - the "pickup" config straight out of the readme
  pickup: {
    ...NEUTRAL,
    wave_type: 1,
    p_env_attack: 0,
    p_env_sustain: 0.02376922019231107,
    p_env_punch: 0.552088780864157,
    p_env_decay: 0.44573175628456596,
    p_base_freq: 0.6823818961421457
  },
  // square wave with a downward slide + flanger, exercises the phaser buffer
  laser: {
    ...NEUTRAL,
    wave_type: 0,
    p_env_sustain: 0.12,
    p_env_punch: 0.4,
    p_env_decay: 0.28,
    p_base_freq: 0.62,
    p_freq_ramp: -0.32,
    p_duty: 0.35,
    p_duty_ramp: -0.12,
    p_pha_offset: 0.2,
    p_pha_ramp: -0.15,
    sound_vol: 0.3
  },
  // wave_type 3 is NOISE, which fills a 32-entry noise buffer from Math.random inside
  // SoundEffect.getRawBuffer - the one generation path that is RNG-driven even for a
  // fully fixed config.
  explosion: {
    ...NEUTRAL,
    wave_type: 3,
    p_env_sustain: 0.24,
    p_env_punch: 0.55,
    p_env_decay: 0.62,
    p_base_freq: 0.18,
    p_freq_ramp: -0.08,
    p_lpf_freq: 0.62,
    p_lpf_resonance: 0.25,
    sound_vol: 0.35
  },
  // sine with vibrato + arpeggio
  powerUp: {
    ...NEUTRAL,
    wave_type: 2,
    p_env_sustain: 0.3,
    p_env_decay: 0.42,
    p_base_freq: 0.32,
    p_freq_ramp: 0.24,
    p_vib_strength: 0.32,
    p_vib_speed: 0.55,
    p_arp_mod: 0.35,
    p_arp_speed: 0.6,
    sound_vol: 0.3
  },
  // ranged parameters - resolveValues() picks a fresh value in each range per play
  randomLaser: {
    ...NEUTRAL,
    wave_type: 0,
    p_env_attack: 0,
    p_env_sustain: { min: 0.1, max: 0.3 },
    p_env_punch: { min: 0.3, max: 0.7 },
    p_env_decay: 0.5,
    p_base_freq: { min: 0.5, max: 0.9 },
    p_freq_ramp: { min: -0.3, max: -0.1 },
    sound_vol: { min: 0.2, max: 0.4 }
  }
};

export const soundNames = Object.keys(sounds);
