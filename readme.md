###### Readme top

<br />
<div align="center">
  <a href="http:\\excaliburjs.com">
    <img src="src/ex-logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Excalibur-JSFXR Plugin</h3>

  <p align="center">
    A plug in that assists in creating 8-bit sound effects for game, stores them, and makes them playable within your Excalibur Game!
    <br />
    
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-plug-in">About The Plug-In</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#sound-configs">Sound Configs</a>
      <ul>
        <li><a href="#basic-sound-configs">Basic Sound Configs</a></li>
        <li><a href="#randomized-sound-configs">Randomized Sound Configs</a></li>
      </ul>
    </li>
    <li><a href="#playing-sounds">Playing Sounds</a>
      <ul>
        <li><a href="#playing-a-stored-sound">Playing a stored sound</a></li>
        <li><a href="#playing-an-ad-hoc-configuration">Playing an ad hoc configuration</a></li>
      </ul>
    </li>
    <li><a href="#making-a-new-sound">Making a new sound</a></li>
    <li><a href="#types">Types</a></li>
    <li><a href="#utility-methods">Utility Methods</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Plug-In

This plug in creates a class which is an abstraction of the JSFXR project that is wrapped nicely to use with Excalibur.

[JSFXR Project](https://sfxr.me/)

In the API:

- initialization of JSFXR
- Ability to store a dictionary(Records) of sound configurations
- Ability to directly play a configuration through the library
- Support for randomized sound parameters using value ranges
- the ability to download the sounds directly as a collection of key/value pairs

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To import the plug-in, from your shell:

```sh
npm i @excaliburjs/plugin-jsfxr
```

Declare and instantiate the new module and initialize

```ts
import { JsfxrResource, SoundConfig } from "@excaliburjs/plugin-jsfxr";
import { sounds } from "./sounds";

let sndPlugin = new JsfxrResource();
sndPlugin.init(); //initializes the JSFXR library
for (const sound in sounds) {
  sndPlugin.loadSoundConfig(sound, sounds[sound]);
}
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Sound Configs

Sound configurations can now be defined with either fixed values or randomized ranges. This allows for more variety in your sound
effects!

### Basic Sound Configs

As you may notice, we are loading sound configurations from sounds.ts in the example above. Let's take a quick look at an example from
sounds.ts using fixed values:

```ts
// sounds.ts
import { SoundConfig } from "@excaliburjs/plugin-jsfxr";
export const sounds: { [key: string]: SoundConfig } = {};

sounds["pickup"] = {
  oldParams: true,
  wave_type: 1,
  p_env_attack: 0,
  p_env_sustain: 0.02376922019231107,
  p_env_punch: 0.552088780864157,
  p_env_decay: 0.44573175628456596,
  p_base_freq: 0.6823818961421457,
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
  sample_size: 16,
};
```

### Randomized Sound Configs

You can now specify ranges for any parameter to add variation to your sounds. Each time the sound is played, a random value within the
specified range will be used:

```ts
sounds["randomLaser"] = {
  oldParams: true,
  wave_type: 0,
  p_env_attack: 0,
  p_env_sustain: { min: 0.1, max: 0.3 },
  p_env_punch: { min: 0.3, max: 0.7 },
  p_env_decay: 0.5,
  p_base_freq: { min: 0.5, max: 0.9 },
  p_freq_limit: 0,
  p_freq_ramp: { min: -0.3, max: -0.1 },
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
  sound_vol: { min: 0.2, max: 0.4 },
  sample_rate: 44100,
  sample_size: 16,
};
```

In this example, each time "randomLaser" is played, it will have slight variations in sustain, punch, base frequency, frequency ramp,
and volume, creating a more dynamic sound experience.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Playing Sounds

There are two ways to get the plugin to play a noise...

### Playing a stored sound

After you've stored your configs in the plugin, you can call the name of the config from the plug-in method `playSound(name: string)`

```ts
sndPlugin.playSound("laser");
```

When playing sounds with randomized parameters, each call will generate a unique variation based on the defined ranges.

### Playing an ad hoc configuration

If you do this manually, your heading for some pain, there are tools that can do this for you, and I'll share those briefly.

the Plugin has a playConfig() method that accepts a SoundConfig object, and it will play it immediately.

```ts
const tempSound: SoundConfig = {
  oldParams: true,
  wave_type: wavetype,
  p_env_attack: m.attack.value,
  p_env_sustain: m.sustain.value,
  p_env_punch: m.punch.value,
  p_env_decay: m.decay.value,
  p_base_freq: m.fstart.value,
  p_freq_limit: m.fmin.value,
  p_freq_ramp: m.fslide.value,
  p_freq_dramp: m.fdelta.value,
  p_vib_strength: m.vibDepth.value,
  p_vib_speed: m.vibSpeed.value,
  p_arp_mod: m.arpMult.value,
  p_arp_speed: m.arpChange.value,
  p_duty: dutycycle,
  p_duty_ramp: dutyramp,
  p_repeat_speed: m.reRate.value,
  p_pha_offset: m.flgOffset.value,
  p_pha_ramp: m.flgSweep.value,
  p_lpf_freq: m.lopassFreq.value,
  p_lpf_ramp: m.lopassSweep.value,
  p_lpf_resonance: m.lopassRes.value,
  p_hpf_freq: m.hipassFreq.value,
  p_hpf_ramp: m.hipassSweep.value,
  sound_vol: m.Gain.value,
  sample_rate: sampleRate, //441000, 22050, 11025, 5512
  sample_size: sampleSize, //16, 8
};

sndPlugin.playConfig(tempSound);
```

You can also use ranges in ad hoc configurations:

```ts
const randomizedSound: SoundConfig = {
  oldParams: true,
  wave_type: 0,
  p_env_attack: 0,
  p_env_sustain: { min: 0.1, max: 0.5 },
  p_base_freq: { min: 0.3, max: 0.8 },
  // ... other parameters
  sound_vol: { min: 0.2, max: 0.6 },
  sample_rate: 44100,
  sample_size: 16,
};

sndPlugin.playConfig(randomizedSound);
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Making a new sound

The old fasion way of doing this is using the [original tool](https://sfxr.me)

![alt text](image.png)

You can use this tool to create the SoundConfig object, which can be copied/pasted from the browser itself.

![alt text](image-1.png)

Another way is using the Excalibur Demo for this plug-in.

![alt text](image-2.png)

This demo let's you create your 'library' of sounds, and then you can click export button in the top left of window and it will
download your sounds.ts file prewritten for you!

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Types

JSFXValueRange

```ts
type JSFXValueRange = {
  min: number;
  max: number;
};
```

JSFXvalue

```ts
type JSFXvalue = number | JSFXValueRange;
```

SoundConfig

```ts
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
```

All SoundConfig properties now accept either a fixed number value or a JSFXValueRange object with min/max properties for randomization.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Utility Methods

#### deleteSoundConfig

```ts
deleteSoundConfig(name: string)
```

This method clears out the the particular element from the sound configs stored

#### getConfigs

```ts
 getConfigs(): { [key: string]: SoundConfig }
```

These methods return a set of key/valuepairs representing all the sound config keys, paired with a SoundConfig object

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Justin Young - [@jyoung424242 (Twitter)](https://twitter.com/your_username) - [Mookie4242 (itch.io)](https://mookie4242.itch.io/)

Project Link: [GitHub Repo: Excalibur-JSFXR](https://github.com/excaliburjs/excalibur-jsfxr)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Special thanks to two great communities that are always available to jump in help, and inspire little projects like these!!!!

About JSFXR: Jsfxr is an online 8 bit sound maker and sfx generator. All you need to make retro sound effects with jsfxr is a web
browser. It's a JavaScript port of the original [sfxr](https://www.drpetter.se/project_sfxr.html) by DrPetter. You can also use it as a
JavaScript library for playing and rendering sfxr sound effects in your games.

- [JSFXR](https://sfxr.me)
- [Excalibur Discord](https://discord.gg/yYY6hGVTf5)
- [Game Dev Shift Discord](https://discord.gg/BZMcuR3FBD)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
