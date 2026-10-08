import * as ex from 'excalibur';
import { JsfxrResource } from '@excaliburjs/plugin-jsfxr';
import { sounds, soundNames } from '../sounds';
import { seedForName, withSeededRandom } from '../seeded-random';
import { digestSamples } from '../waveform-view';
import { addLogo } from '../logo';

const WIDTH = 800;
const HEIGHT = 600;

interface PlayedAudio {
  frames: number;
  sampleRate: number;
  digest: string;
  starts: number;
}

/**
 * Counts AudioBufferSourceNode.start() calls since the last button click. Excalibur also
 * unlocks its own WebAudio context by starting a silent buffer on the first user gesture, so
 * a cumulative counter would report a number that depends on engine internals rather than on
 * the plugin.
 */
let startsSinceClick = 0;

/**
 * Instrumentation, not decoration: jsfxr's `getAudio()` builds a real WebAudio AudioBuffer
 * and plays it through an AudioBufferSourceNode. Wrapping `start()` lets the page report what
 * the plugin actually pushed into the audio graph - frame count, sample rate and a digest of
 * the PCM - which is the closest a screenshot can get to asserting "the right sound played".
 *
 * (The digest here is over the Float32 channel data WebAudio holds, so it is not expected to
 * equal the waveform page's digest of the same sound, which hashes the float64 samples jsfxr
 * produced. Each is stable on its own.)
 */
function instrumentWebAudio(onPlayed: (info: PlayedAudio) => void) {
  const proto = (window as any).AudioBufferSourceNode?.prototype;
  if (!proto) return;
  const originalStart = proto.start;
  proto.start = function (this: AudioBufferSourceNode, ...args: any[]) {
    startsSinceClick++;
    const buffer = this.buffer;
    if (buffer) {
      const data = buffer.getChannelData(0);
      onPlayed({
        frames: buffer.length,
        sampleRate: buffer.sampleRate,
        digest: digestSamples(Array.from(data)),
        starts: startsSinceClick
      });
    }
    return originalStart.apply(this, args as any);
  };
}

interface State {
  ready: boolean;
  configCount: number;
  lastAction: string;
  result: string;
  ok: boolean;
  played?: PlayedAudio;
}

const BUTTON_X = 24;
const BUTTON_Y = 96;
const BUTTON_W = 300;
const BUTTON_H = 40;
const BUTTON_GAP = 8;

// The last entry deliberately asks for a sound that was never loaded - playSound() throws for
// unknown names, and the caught message is rendered, so the error path is snapshotted too.
const buttons = [...soundNames, 'notLoaded'];

/**
 * Machine-readable version of what the panel draws. The screenshot is a visual regression
 * check; this is the exact assertion - the e2e suite compares it against recorded golden
 * values, so a change in what reaches the audio graph fails the run outright instead of
 * hiding under a pixel-diff tolerance.
 */
function publishReport(state: State) {
  (window as any).__jsfxrReport = {
    page: 'playback',
    ready: state.ready,
    configCount: state.configCount,
    lastAction: state.lastAction,
    ok: state.ok,
    result: state.result,
    played: state.played ?? null
  };
}

async function main() {
  const state: State = {
    ready: false,
    configCount: 0,
    lastAction: 'none',
    result: 'click a sound',
    ok: true
  };

  instrumentWebAudio((info) => (state.played = info));

  const plugin = new JsfxrResource();
  for (const name of soundNames) {
    plugin.loadSoundConfig(name, sounds[name]);
  }
  state.ready = plugin.jsfxr !== undefined;
  state.configCount = Object.keys(plugin.getConfigs()).length;

  publishReport(state);

  const game = new ex.Engine({
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: ex.Color.fromHex('#0d1017'),
    antialiasing: false,
    suppressConsoleBootMessage: true
  });

  const surface = new ex.Canvas({
    width: WIDTH,
    height: HEIGHT,
    // redrawn every frame from `state` - no caching, so a click is reflected immediately
    cache: false,
    draw: (ctx) => {
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.textBaseline = 'top';

      ctx.font = '14px monospace';
      ctx.fillStyle = '#e6e9f0';
      ctx.fillText('@excaliburjs/plugin-jsfxr - playback', 24, 24);
      ctx.font = '12px monospace';
      ctx.fillStyle = state.ready ? '#7fb069' : '#d1495b';
      ctx.fillText(`init: ${state.ready ? 'ok' : 'FAILED'}   configs loaded: ${state.configCount}`, 24, 46);

      buttons.forEach((name, i) => {
        const y = BUTTON_Y + i * (BUTTON_H + BUTTON_GAP);
        const active = state.lastAction === name;
        ctx.fillStyle = active ? '#25405c' : '#161b26';
        ctx.fillRect(BUTTON_X, y, BUTTON_W, BUTTON_H);
        ctx.strokeStyle = active ? '#5ad1c4' : '#2f3646';
        ctx.lineWidth = 1;
        ctx.strokeRect(BUTTON_X + 0.5, y + 0.5, BUTTON_W - 1, BUTTON_H - 1);
        ctx.fillStyle = '#e6e9f0';
        ctx.font = '13px monospace';
        ctx.fillText(`play "${name}"`, BUTTON_X + 12, y + 13);
      });

      const panelX = BUTTON_X + BUTTON_W + 24;
      const panelW = WIDTH - panelX - 24;
      ctx.fillStyle = '#161b26';
      ctx.fillRect(panelX, BUTTON_Y, panelW, 220);
      ctx.strokeStyle = '#2f3646';
      ctx.strokeRect(panelX + 0.5, BUTTON_Y + 0.5, panelW - 1, 219);

      ctx.font = '12px monospace';
      let y = BUTTON_Y + 14;
      const line = (text: string, color = '#98a2b8') => {
        ctx.fillStyle = color;
        ctx.fillText(text, panelX + 14, y);
        y += 18;
      };
      line('last call', '#e6e9f0');
      line(`playSound("${state.lastAction}")`);
      line(state.result, state.ok ? '#7fb069' : '#d1495b');
      y += 10;
      line('audio graph', '#e6e9f0');
      if (state.played) {
        line(`frames:     ${state.played.frames}`);
        line(`sampleRate: ${state.played.sampleRate}`);
        line(`fnv:        ${state.played.digest}`);
        line(`starts:     ${state.played.starts}`);
      } else {
        line('nothing started yet');
      }
    }
  });

  const panel = new ex.ScreenElement({ x: 0, y: 0, width: WIDTH, height: HEIGHT, z: 0 });
  panel.graphics.use(surface);
  game.add(panel);

  buttons.forEach((name, i) => {
    const y = BUTTON_Y + i * (BUTTON_H + BUTTON_GAP);
    const hit = new ex.ScreenElement({ x: BUTTON_X, y, width: BUTTON_W, height: BUTTON_H, z: 1 });
    // ScreenElement defaults to hit-testing against its *graphics* bounds, and these hit areas
    // are deliberately invisible (the whole page is drawn by the single Canvas below), so
    // point at the box collider instead - otherwise clicks silently hit nothing.
    hit.pointer.useGraphicsBounds = false;
    hit.pointer.useColliderShape = true;
    hit.on('pointerup', () => {
      state.lastAction = name;
      state.played = undefined;
      startsSinceClick = 0;
      try {
        // Seeded per name so the ranged config ("randomLaser") and the NOISE buffer resolve
        // to the same PCM on every run - otherwise the reported digest would never repeat.
        withSeededRandom(seedForName(name), () => plugin.playSound(name));
        state.ok = true;
        state.result = 'returned without throwing';
      } catch (e) {
        state.ok = false;
        state.result = `threw: ${(e as Error).message}`;
      }
      publishReport(state);
    });
    game.add(hit);
  });

  const logo = addLogo(game, WIDTH - 60, 8, 40);
  await game.start(new ex.Loader([logo]));
}

main();
