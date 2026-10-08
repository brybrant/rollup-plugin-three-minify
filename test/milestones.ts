import { resolve } from 'node:path';

import { WebView } from 'bun';
import { beforeAll, afterAll, describe, expect, test } from 'bun:test';

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
    <script>
      window.addEventListener('error', (event) => {
        console.error(String(event.error?.stack ?? event.message));
      });

      window.addEventListener('unhandledrejection', (event) => {
        console.error(String(event.reason));
      });
    </script>
    <script>${js}</script>
  </body>
</html>`;

const node_modules = resolve(process.cwd(), 'node_modules');

const materialShader = /_(vert|frag)$/;

const stringify = (any: unknown) => JSON.stringify(any, null, 2);

/**
 * Run tests for each milestone revision of Three.js
 * @param milestone Three.js milestone revision (package name)
 */
export async function defineMilestoneTests(milestone: string) {
  let view: WebView;

  const consoleErrors: string[] = [];

  let finish = () => {};

  beforeAll(() => {
    view = new WebView({
      width: 120,
      height: 120,
      backend: {
        type: 'chrome',
        url: false,
        // argv: ['--enable-gpu'],
      },
      console: (type, ...args) => {
        if (type === 'error') {
          consoleErrors.push(args.map(String).join(' '));
        }

        if (type === 'info' && args[0] === 'Finished!') {
          finish();
        }
      },
    });
  });

  afterAll(() => {
    view.close();
  });

  const three = (await import(milestone)) as typeof THREE;

  const revision = Number(three.REVISION);

  const metadata = computeMetadata(revision);

  const { chunks, materials } = metadata;

  describe(`Three.js r${revision}`, () => {
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
        input: `./test/bundles/${name}.ts`,
        platform: 'browser',
        plugins: [globalPlugin, threeMinifyPlugin(options)],
        resolve: {
          alias: {
            three: threeModuleID,
          },
        },
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
      consoleErrors.length = 0;

      const build = await rolldown(config);
      const { output } = await build.generate({
        format: 'iife',
        minify: false,
      });
      await build.close();

      const content = html(output[0].code);

      const finished = new Promise<void>((resolve) => {
        finish = resolve;
      });

      await view.navigate(
        `data:text/html;charset=utf-8,${encodeURIComponent(content)}`,
      );

      await finished;

      if (consoleErrors.length > 0) {
        console.error(`"${name}" (r${revision}):\n`, stringify(consoleErrors));
      }

      expect(consoleErrors).toEqual([]);
    });
  });
}
