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
    features: 'map',
    materials: 'basic',
  }),
  createConfig('depth', {
    features: ['alphamap', 'alphatest'],
    materials: 'depth',
  }),
  createConfig('lambert', {
    features: 'emissivemap',
    materials: 'lambert',
  }),
  createConfig('normal', {
    features: ['dithering', 'normalmap'],
    materials: 'normal',
  }),
  createConfig('phong', {
    features: 'envmap',
    materials: 'phong',
  }),
  createConfig('physical', {
    features: 'envmap',
    materials: ['physical', revision < 146 ? 'cube' : 'backgroundCube'],
  }),
  createConfig('shadow', {
    features: ['bumpmap', 'shadows'],
    materials: ['lambert', 'phong'],
  }),
  createConfig('standard', {
    features: 'envmap',
    materials: 'standard',
  }),
  createConfig('toon', {
    features: 'lightmap',
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
