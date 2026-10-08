import { expect, test } from '@playwright/test';
import type { Frame, Page } from '@playwright/test';
import { EXAMPLE_CASES } from './manifest';

const INSTALL_DETERMINISM_HOOKS = `
  (function () {
    let seed = 0x2f6e2b1;
    Math.random = function () {
      seed |= 0;
      seed = (seed + 0x9e3779b9) | 0;
      let t = Math.imul(seed ^ (seed >>> 16), 0x21f0aaad);
      t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
      return ((t ^ (t >>> 15)) >>> 0) / 4294967296;
    };
  })();
  window.__exStep = async function (steps, stepMs) {
    const engine = window.___EXCALIBUR_DEVTOOL;
    if (!engine || !engine.clock) {
      return false;
    }
    if (!engine.clock.__isFrozen) {
      if (engine.clock.isRunning()) {
        engine.clock.stop();
      }
      engine.clock.__isFrozen = true;
      // Belt-and-suspenders: some engine paths (e.g. regaining window focus) call
      // clock.start() again, which would resume the real rAF loop and undo the freeze.
      engine.clock.start = function () {};
    }
    var YIELD_EVERY = 3;
    for (let i = 0; i < steps; i++) {
      engine.clock.update(stepMs || 16.6);
      if ((i + 1) % YIELD_EVERY === 0 || i === steps - 1) {
        await new Promise(function (resolve) {
          requestAnimationFrame(resolve);
        });
      }
    }
    return true;
  };
`;

async function stepEngineClock(frame: Frame, steps: number) {
  await frame.evaluate((steps) => (window as any).__exStep?.(steps), steps);
}

async function isPlayButtonShown(frame: Frame) {
  return await frame.evaluate(() => {
    const button = document.querySelector('#excalibur-play-root button') as HTMLElement | null;
    if (!button) return false;
    return getComputedStyle(button).display !== 'none';
  });
}

for (const exampleCase of EXAMPLE_CASES) {
  const file = exampleCase.file ?? 'index.html';
  const name = exampleCase.name ?? exampleCase.dir;

  test(`${name} matches golden master`, async ({ page }) => {
    test.skip(!!exampleCase.skip, exampleCase.skip);

    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => consoleErrors.push(String(error)));

    await page.addInitScript(INSTALL_DETERMINISM_HOOKS);
    await page.goto(`/${exampleCase.dir}/${file}`);

    const frame = page.mainFrame();
    const canvas = frame.locator('canvas').first();
    await canvas.waitFor({ state: 'visible', timeout: 10_000 });

    // Freeze frame timing as early as possible - safe to do before the play button ever
    // appears since we drive the original clock instance in place (see __exStep above).
    await stepEngineClock(frame, 1);

    let playButtonReady = false;
    for (let i = 0; i < 30 && !playButtonReady; i++) {
      playButtonReady = await isPlayButtonShown(frame);
      if (!playButtonReady) {
        await stepEngineClock(frame, 2);
      }
    }
    const playButton = frame.locator('#excalibur-play-root button');
    if (playButtonReady) {
      await playButton.click();
    }
    await expect(playButton, 'loader play button should be dismissed before capturing').toBeHidden();

    if (exampleCase.action) {
      await exampleCase.action(page, canvas);
    }

    await stepEngineClock(frame, exampleCase.settleSteps ?? 10);

    expect(consoleErrors, 'example page threw').toEqual([]);

    const report = await frame.evaluate(() => (window as any).__jsfxrReport);
    if (process.env.EX_DUMP_REPORT) {
      console.log(`REPORT ${name}: ${JSON.stringify(report)}`);
    }
    expect(report, 'example page should publish window.__jsfxrReport').toBeTruthy();
    if (exampleCase.expectedReport) {
      expect(report, 'generated audio should match the recorded golden report').toEqual(exampleCase.expectedReport);
    }

    const screenshot = await page.screenshot();
    expect(screenshot).toMatchSnapshot(`${name}.png`, { maxDiffPixelRatio: exampleCase.tolerance ?? 0.01 });
  });
}
