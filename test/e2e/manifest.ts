import type { Locator, Page } from '@playwright/test';

export interface ExampleCase {
  dir: string;
  file?: string;
  name?: string;
  action?: (page: Page, canvas: Locator) => Promise<void>;
  skip?: string;
  tolerance?: number;
  settleSteps?: number;
  expectedReport?: unknown;
}

const BUTTON_X = 24 + 300 / 2;
const BUTTON_Y = 96 + 40 / 2;
const BUTTON_STRIDE = 48;

function buttonCenter(index: number) {
  return { x: BUTTON_X, y: BUTTON_Y + index * BUTTON_STRIDE };
}

export const EXAMPLE_CASES: ExampleCase[] = [
  // Static render of the generated PCM - no interaction needed, the plots are drawn during boot.
  {
    dir: 'waveform',
    expectedReport: {
      page: 'waveform',
      plots: [
        { name: 'pickup', samples: 19925, sampleRate: 44100, clipped: 2, digest: 'e48fc61c' },
        { name: 'laser', samples: 9282, sampleRate: 44100, clipped: 0, digest: '5a8aa602' },
        { name: 'explosion', samples: 44202, sampleRate: 44100, clipped: 1477, digest: '105667da' },
        { name: 'powerUp', samples: 26641, sampleRate: 44100, clipped: 0, digest: 'c081ab5c' },
        { name: 'randomLaser', samples: 29309, sampleRate: 44100, clipped: 0, digest: 'd7cfbd1e' }
      ]
    }
  },
  // "explosion" (index 2) is the NOISE-wave config: its generation is the one that draws from
  // Math.random, so this case covers the seeded-generation path end to end.
  {
    dir: 'playback',
    name: 'playback-explosion',
    action: async (_page, canvas) => {
      await canvas.click({ position: buttonCenter(2) });
    },
    // frames matches the waveform page's `explosion` sample count - same config, same seed,
    // so the PCM handed to WebAudio is the PCM that page plots. (The digest differs because
    // WebAudio holds Float32 and the waveform page hashes jsfxr's float64 output.)
    expectedReport: {
      page: 'playback',
      ready: true,
      configCount: 5,
      lastAction: 'explosion',
      ok: true,
      result: 'returned without throwing',
      played: { frames: 44202, sampleRate: 44100, digest: '56bfb362', starts: 1 }
    }
  },
  // "randomLaser" (index 4) resolves {min,max} ranges through JsfxrResource.rangeValue().
  {
    dir: 'playback',
    name: 'playback-random-laser',
    action: async (_page, canvas) => {
      await canvas.click({ position: buttonCenter(4) });
    },
    expectedReport: {
      page: 'playback',
      ready: true,
      configCount: 5,
      lastAction: 'randomLaser',
      ok: true,
      result: 'returned without throwing',
      played: { frames: 29309, sampleRate: 44100, digest: '95046882', starts: 1 }
    }
  },
  // "notLoaded" (index 5) was never registered - playSound() throws and the page renders the
  // caught message, so the error path has a golden master too.
  {
    dir: 'playback',
    name: 'playback-missing-sound',
    action: async (_page, canvas) => {
      await canvas.click({ position: buttonCenter(5) });
    },
    expectedReport: {
      page: 'playback',
      ready: true,
      configCount: 5,
      lastAction: 'notLoaded',
      ok: false,
      result: 'threw: Sound notLoaded not found',
      played: null
    }
  }
];
