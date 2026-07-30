/**
 * Playwright cannot run `chromium.launch()`
 * This patches it (for now)
 * https://github.com/oven-sh/bun/issues/15679#issuecomment-4366905628
 */
import net from 'node:net';

// eslint-disable-next-line @typescript-eslint/unbound-method
const originalConnect = net.Socket.prototype.connect;

net.Socket.prototype.connect = function (...args) {
  let options = args[0];

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  if (Array.isArray(options)) options = options[0];

  const hasFd =
    options &&
    typeof options === 'object' &&
    'fd' in options &&
    options.fd != null;

  // @ts-expect-error Forward the args (it's fine)
  const result = originalConnect.apply(this, args);

  if (hasFd && this.connecting) {
    // @ts-expect-error Apparently this is not read-only?
    this.connecting = false;

    process.nextTick(() => {
      // @ts-expect-error Apparently this property does exist?
      if (!this.destroyed && !this.connected) {
        // @ts-expect-error Same error as above
        this.connected = true;
        this.emit('connect');
      }
    });
  }
  return result;
};

// My code...
import { resolve } from 'node:path';

import { Glob } from 'bun';
import { describe, expect, test } from 'bun:test';
import { chromium, expect as playwrightExpect } from '@playwright/test';

import { rolldown, type Plugin, type InputOptions } from 'rolldown';

import type * as THREE from 'three';

import threeMinifyPlugin from 'rollup-plugin-three-minify';
import type { UserOptions } from 'rollup-plugin-three-minify';

import { computeMetadata } from '../src/const.ts';

/**
 * Generate HTML
 * @param js Bundle JavaScript
 * @returns HTML
 */
const html = (js: string) => `
<!doctype html>
<html>
  <head>
    <meta charset='utf-8'>
    <meta name='darkreader-lock'/>
    <style>
    html {
      overflow: hidden;
      background: #000;
    }
    body {
      position: relative;
      margin: 0;
      min-height: 100vh;
      min-height: 100dvh;
    }
    canvas {
      position: absolute;
      width: 100%;
      height: 100%;
    }
    .label {
      position: absolute;
      right: 0;
      bottom: 0;
      padding: 3px 5px;
      background: rgba(255,255,255,0.5);
    }
    </style>
  </head>
  <body>
    <script>${js}</script>
  </body>
</html>`;

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const milestonesGlob = new Glob('three-r?*');

const node_modules = resolve(process.cwd(), 'node_modules');

const milestones = await Array.fromAsync(
  milestonesGlob.scan({
    cwd: node_modules,
    onlyFiles: false,
  }),
);

milestones.sort();

const materialShader = /_(vert|frag)$/;

const stringify = (any: unknown) => JSON.stringify(any, null, 2);

for (const milestone of milestones) {
  const three = (await import(milestone)) as typeof THREE;

  const revision = Number(three.REVISION);

  const metadata = computeMetadata(revision);

  const { chunks, materials } = metadata;

  describe(`Three.js ${milestone}`, () => {
    test.concurrent(`ShaderChunk metadata compatibility`, () => {
      const PluginChunk = Object.entries(chunks)
        .filter(([, meta]) => meta.status === 'available')
        .map(([chunk]) => chunk)
        .sort();

      const ThreeChunk = Object.keys(three.ShaderChunk)
        .filter((chunk) => !materialShader.test(chunk))
        .sort();

      expect(PluginChunk).toEqual(ThreeChunk);
    });

    test.concurrent(`ShaderLib metadata compatibility`, () => {
      const PluginLib = Object.entries(materials)
        .filter(([, meta]) => meta.status === 'available')
        .map(([material]) => material)
        .sort();

      const ThreeLib = Object.keys(three.ShaderLib).sort();

      expect(PluginLib).toEqual(ThreeLib);
    });

    let globals = '';

    Object.entries({
      Revision: revision,
      ColorSpace: revision < 152 ? 'encoding' : 'colorSpace',
      sRGB: three[revision < 152 ? 'sRGBEncoding' : 'SRGBColorSpace'],
      OctetFormat: three[revision < 136 ? 'LuminanceFormat' : 'RedFormat'],
    }).map(([name, value]) => {
      const v = typeof value === 'string' ? `'${value}'` : value;
      globals += `window._${name} = ${v};\n`;
    });

    const globalPlugin: Plugin = {
      name: '@brybrant/three-global-plugin',
      banner: globals,
    };

    const threeModuleID = resolve(
      node_modules,
      milestone,
      'build/three.module.js',
    );

    /**
     * @param name Bundle name
     * @param options User options
     * @returns config
     */
    const createConfig = (
      name: string,
      options: UserOptions,
    ): { name: string; config: InputOptions } => ({
      name,
      config: {
        resolve: {
          alias: {
            three: threeModuleID,
          },
        },
        input: `./test/bundles/${name}.js`,
        plugins: [globalPlugin, threeMinifyPlugin(options)],
      },
    });

    const configs = [
      createConfig('basic', {
        debug: true,
        features: 'map',
        materials: 'basic',
        /** Test `_occlusion_fragment` and `_occlusion_vertex` (since r161) */
        xr: true,
      }),
      createConfig('depth', {
        debug: true,
        features: ['alphamap', 'alphatest'],
        materials: 'depth',
      }),
      createConfig('lambert', {
        debug: true,
        features: 'emissivemap',
        materials: 'lambert',
      }),
      createConfig('normal', {
        debug: true,
        features: ['dithering', 'normalmap'],
        materials: 'normal',
      }),
      createConfig('phong', {
        debug: true,
        features: ['envmap', 'lightmap'],
        materials: 'phong',
      }),
      createConfig('physical', {
        debug: true,
        features: 'envmap',
        materials: ['physical', revision < 146 ? 'cube' : 'backgroundCube'],
      }),
      createConfig('shadow', {
        debug: true,
        /** Test `fragment` and `vertex` for WebGLShadowMap */
        features: ['bumpmap', 'shadows'],
        materials: ['lambert', 'phong'],
      }),
      createConfig('standard', {
        debug: true,
        features: 'envmap',
        materials: 'standard',
      }),
      createConfig('toon', {
        debug: true,
        materials: 'toon',
      }),
      createConfig('matcap', {
        debug: true,
        materials: 'matcap',
      }),
      createConfig('custom', {
        chunks: ['worldpos_vertex'],
        debug: true,
        features: ['colorspace', 'dithering', 'normals', 'vertices'],
      }),
    ];

    test.each(configs)('Config "$name"', async ({ name, config }) => {
      const build = await rolldown(config);
      const { output } = await build.generate({ format: 'iife' });
      await build.close();

      const content = html(output[0].code);

      await page.setContent(content);

      /** Wait for the frame to render */
      await playwrightExpect(page)
        .toHaveTitle('Finished!')
        .then(async () => {
          const errors = await page.consoleMessages().then((messages) => {
            return messages
              .filter((message) => message.type() === 'error')
              .map((message) => message.text());
          });

          expect(errors.length).toBe(0);

          if (errors.length > 0) {
            console.error(`"${name}" (${milestone}):\n${stringify(errors)}`);
          }
        })
        .catch(async (error: unknown) => {
          console.error(error);

          const pageErrors = await page.pageErrors();

          expect(pageErrors.length).toBe(0);

          if (pageErrors.length > 0) {
            console.error(
              `"${name}" (${milestone}):\n${stringify(pageErrors)}`,
            );
          }
        })
        .finally(async () => {
          await page.clearPageErrors();
          await page.clearConsoleMessages();
        });
    });
  });
}
