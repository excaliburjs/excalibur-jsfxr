/**
 * Drawing helpers shared by the two example pages. Everything here is plain canvas2d so the
 * rendered pixels are a direct function of the sample data handed in - that is the whole
 * point of the snapshot suite: if the generated PCM changes, the picture changes.
 */

/** FNV-1a over the quantized 16-bit samples. Rendered on-page so a byte-level change in the generated audio is visible in the screenshot even where the plotted envelope looks identical. */
export function digestSamples(samples: number[]): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < samples.length; i++) {
    const q = Math.round(samples[i] * 32767) & 0xffff;
    hash ^= q & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (q >> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

const PALETTE = [
  '#2b3a55',
  '#3d5a80',
  '#4f8a8b',
  '#7fb069',
  '#d9b310',
  '#e08a3c',
  '#d1495b',
  '#a4508b',
  '#6c5b7b',
  '#355c7d',
  '#9fd3c7',
  '#ec9a9a',
  '#c1c8e4',
  '#f6ae2d',
  '#33658a',
  '#758e4f'
];

/**
 * The digest again, as 8 colour blocks (one per hex nibble). Fonts differ between machines;
 * these blocks do not, so the digest stays a hard assertion even if glyph rendering drifts.
 */
export function drawDigestBlocks(ctx: CanvasRenderingContext2D, x: number, y: number, digest: string) {
  for (let i = 0; i < digest.length; i++) {
    const nibble = parseInt(digest[i], 16);
    ctx.fillStyle = PALETTE[nibble];
    ctx.fillRect(x + i * 11, y, 9, 9);
  }
}

export interface WaveformPlot {
  name: string;
  samples: number[];
  sampleRate: number;
  clipped: number;
}

/** Min/max envelope plot of the sample buffer, plus the digest strip and a text caption. */
export function drawWaveform(ctx: CanvasRenderingContext2D, plot: WaveformPlot, x: number, y: number, w: number, h: number) {
  const digest = digestSamples(plot.samples);

  ctx.fillStyle = '#161b26';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#2f3646';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

  const plotX = x + 4;
  const plotW = w - 8;
  const plotTop = y + 20;
  const plotH = h - 44;
  const mid = plotTop + plotH / 2;

  // zero line
  ctx.strokeStyle = '#39415a';
  ctx.beginPath();
  ctx.moveTo(plotX, Math.round(mid) + 0.5);
  ctx.lineTo(plotX + plotW, Math.round(mid) + 0.5);
  ctx.stroke();

  // One vertical min..max bar per horizontal pixel column - shows the real envelope shape
  // rather than a decimated line that could hide a change between sample points.
  ctx.fillStyle = '#5ad1c4';
  const total = plot.samples.length;
  for (let px = 0; px < plotW; px++) {
    const from = Math.floor((px * total) / plotW);
    const to = Math.max(from + 1, Math.floor(((px + 1) * total) / plotW));
    let min = 1;
    let max = -1;
    for (let i = from; i < to && i < total; i++) {
      const s = plot.samples[i];
      if (s < min) min = s;
      if (s > max) max = s;
    }
    if (min > max) continue;
    // jsfxr's normalized samples can exceed [-1, 1] when the config clips (see the `clipped`
    // count in the caption) - clamp so an over-driven sound stays inside its own plot box
    // instead of drawing over the caption underneath it.
    const top = mid - Math.min(1, max) * (plotH / 2);
    const bottom = mid - Math.max(-1, min) * (plotH / 2);
    ctx.fillRect(plotX + px, top, 1, Math.max(1, bottom - top));
  }

  ctx.font = '12px monospace';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#e6e9f0';
  ctx.fillText(plot.name, x + 6, y + 4);

  const durationMs = Math.round((plot.samples.length / plot.sampleRate) * 1000);
  ctx.fillStyle = '#98a2b8';
  ctx.fillText(`${plot.samples.length} samples  ${durationMs}ms  clipped:${plot.clipped}  fnv:${digest}`, x + 6, y + h - 16);
  drawDigestBlocks(ctx, x + w - 8 - 8 * 11, y + 4, digest);
}
