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

/**
 * @param {string} name
 * @param {import('rollup-plugin-three-minify').UserOptions} options
 * @returns {import('rollup').RollupOptions} Rollup config options
 */
function createConfig(name, options) {
  return {
    input: `./test/rollx/src/${name}.js`,
    output: {
      file: `./test/rollx/dist/${name}.js`,
    },
    plugins: [
      globalPlugin,
      ...(roll === 'up' ? [nodeResolve()] : []),
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
  };
}

const configs = [
  createConfig('basic', {
    textures: true,
    features: 'map',
    materials: 'basic',
  }),
  createConfig('depth', {
    textures: true,
    features: ['alphamap', 'alphatest'],
    materials: 'depth',
  }),
  createConfig('lambert', {
    textures: true,
    features: 'emissivemap',
    materials: 'lambert',
  }),
  createConfig('normal', {
    textures: true,
    features: ['dithering', 'normalmap'],
    materials: 'normal',
  }),
  createConfig('phong', {
    environment: true,
    materials: 'phong',
  }),
  createConfig('physical', {
    background: true,
    environment: true,
    includes: 'cube_uv_reflection_fragment',
    materials: ['physical', revision < 146 ? 'cube' : 'backgroundCube'],
  }),
  createConfig('shadow', {
    shadows: true,
    features: ['bumpmap', 'lightmap'],
    materials: ['lambert', 'phong'],
  }),
  createConfig('standard', {
    environment: true,
    includes: 'cube_uv_reflection_fragment',
    materials: 'standard',
  }),
  createConfig('toon', {
    textures: true,
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

Promise.all(configs.map((config) => bundler(config)))
  .then((builds) => {
    /** @type {Promise<void>[]} */
    const finished = [];

    for (let i = 0; i < builds.length; i++) {
      const build = builds[i];

      finished.push(build.write(configs[i].output).then(() => build.close));
    }

    return Promise.all(finished);
  })
  .finally(() => console.log('Finised!'));
