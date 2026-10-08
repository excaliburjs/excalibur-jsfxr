import * as ex from 'excalibur';
import { JsfxrResource } from '@excaliburjs/plugin-jsfxr';
import { sounds } from '../sounds';
import { seedForName, withSeededRandom } from '../seeded-random';
import { digestSamples, drawWaveform, type WaveformPlot } from '../waveform-view';
import { addLogo } from '../logo';

const WIDTH = 800;
const HEIGHT = 600;

/**
 * Renders the PCM the plugin actually generates.
 *
 * The sample data comes out of the *same* call chain the plugin's playback path uses:
 * `JsfxrResource.resolveValues(config)` -> `sfxr.toWave(synthdef)`. `playSound`/`playConfig`
 * are literally `sfxr.toWave(...).getAudio().play()`, so everything here except the final
 * `.getAudio()` is shared with production playback. If sound generation regresses, these
 * plots (and the FNV digest printed under each one) change.
 */
async function main() {
  const plugin = new JsfxrResource();
  for (const name of Object.keys(sounds)) {
    plugin.loadSoundConfig(name, sounds[name]);
  }

  // Seeded per sound name so ranged parameters and the NOISE buffer are reproducible
  // independently of how many draws anything else made - see seeded-random.ts
  const plots: WaveformPlot[] = Object.keys(plugin.getConfigs()).map((name) =>
    withSeededRandom(seedForName(name), () => {
      const resolved = plugin.resolveValues(plugin.getConfigs()[name]);
      const wave = plugin.jsfxr.toWave(resolved);
      return {
        name,
        samples: wave.buffer as number[],
        sampleRate: resolved.sample_rate ?? 44100,
        clipped: wave.clipping as number
      };
    })
  );

  const game = new ex.Engine({
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: ex.Color.fromHex('#0d1017'),
    antialiasing: false,
    pixelArt: false,
    suppressConsoleBootMessage: true
  });

  const surface = new ex.Canvas({
    width: WIDTH,
    height: HEIGHT,
    cache: true,
    draw: (ctx) => {
      ctx.fillStyle = '#0d1017';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      ctx.font = '14px monospace';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#e6e9f0';
      ctx.fillText('@excaliburjs/plugin-jsfxr - generated waveforms', 12, 10);
      ctx.font = '12px monospace';
      ctx.fillStyle = '#98a2b8';
      ctx.fillText(`${plots.length} configs loaded via JsfxrResource.loadSoundConfig()`, 12, 28);

      const top = 50;
      const rowH = 106;
      plots.forEach((plot, i) => {
        drawWaveform(ctx, plot, 12, top + i * (rowH + 4), WIDTH - 24, rowH);
      });
    }
  });

  // Machine-readable version of what is drawn. The screenshot is a visual regression check;
  // this is the exact assertion - the e2e suite compares it against recorded golden values, so
  // a change in generated PCM fails the run outright instead of hiding under a pixel-diff
  // tolerance.
  (window as any).__jsfxrReport = {
    page: 'waveform',
    plots: plots.map((plot) => ({
      name: plot.name,
      samples: plot.samples.length,
      sampleRate: plot.sampleRate,
      clipped: plot.clipped,
      digest: digestSamples(plot.samples)
    }))
  };

  const panel = new ex.ScreenElement({ x: 0, y: 0, width: WIDTH, height: HEIGHT });
  panel.graphics.use(surface);
  game.add(panel);

  const logo = addLogo(game, WIDTH - 60, 8, 40);
  await game.start(new ex.Loader([logo]));
}

main();
