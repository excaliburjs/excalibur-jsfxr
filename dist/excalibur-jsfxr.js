export default class JsfxrResource {
    sounds = {};
    jsfxrModule;
    jsfxr;
    async init() {
        this.jsfxrModule = await import("./sfxr.mjs");
        this.jsfxr = this.jsfxrModule.default;
    }
    loadSoundConfig(name, config) {
        this.sounds[name] = config;
    }
    deleteSoundConfig(name) {
        delete this.sounds[name];
    }
    playConfig(config) {
        if (this.jsfxr === undefined)
            return;
        if (this.jsfxrModule === undefined)
            return;
        const a = this.jsfxr.toAudio(config);
        a.play();
    }
    playSound(name) {
        if (this.jsfxr === undefined)
            return;
        if (this.jsfxrModule === undefined)
            return;
        const config = this.sounds[name];
        if (!config) {
            throw new Error(`Sound ${name} not found`);
        }
        const a = this.jsfxr.toAudio(config);
        a.play();
    }
    getConfigs() {
        return this.sounds;
    }
}
//# sourceMappingURL=excalibur-jsfxr.js.map