/**
 * Only run this script from the root directory using one of the following:
 * - `npm run rollup`
 * - `npm run rolldown`
 */
import { env } from 'node:process';

import html from '@rollup/plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import threeMinifyPlugin from 'rollup-plugin-three-minify';

import { globalPlugin, revision } from './global-plugin.js';

/** @type {'up'|'down'} */
const roll = env.ROLL;

const resolvePlugin = roll === 'up' ? nodeResolve() : {};

/**
 * @param {string} name
 * @param {import('rollup-plugin-three-minify').UserOptions} options
 * @returns {{ name: string, config: import('rollup').RollupOptions }} config
 */
function createConfig(name, options) {
  return {
    name,
    config: {
      input: `./test/rollx/src/${name}.js`,
      output: {
        file: `./test/rollx/dist/${name}.js`,
      },
      plugins: [
        globalPlugin,
        resolvePlugin,
        html({
          fileName: `${name}.html`,
          template: () => `
          <!doctype html>
          <html>
            <head>
              <meta charset='utf-8'>
              <meta name='darkreader-lock'/>
              <title>${name}</title>
              <link href='../../index.css' rel='stylesheet'/>
            </head>
            <body>
              <script src='${name}.js'></script>
            </body>
          </html>`,
        }),
        threeMinifyPlugin(options),
      ],
    },
  };
}

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
];

/**
 * Might also be {import('rolldown').rolldown} but they share the same API sooo
 * @type {import('rollup').rollup}
 */
const bundler = await import(`roll${roll}`).then(
  (module) => module[`roll${roll}`],
);

for (const config of configs) {
  const build = await bundler(config.config);
  await build.write(config.config.output);
  await build.close();
}
