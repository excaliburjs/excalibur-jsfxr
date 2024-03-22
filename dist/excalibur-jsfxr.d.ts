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
export declare class JsfxrResource {
    sounds: {
        [key: string]: SoundConfig;
    };
    jsfxrModule: any;
    jsfxr: any;
    init(): Promise<void>;
    loadSoundConfig(name: string, config: SoundConfig): void;
    deleteSoundConfig(name: string): void;
    playConfig(config: SoundConfig): void;
    playSound(name: string): void;
    getConfigs(): {
        [key: string]: SoundConfig;
    };
}
//# sourceMappingURL=excalibur-jsfxr.d.ts.map