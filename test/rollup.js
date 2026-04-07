import html from '@rollup/plugin-html';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import threeMinifyPlugin from '@brybrant/rollup-plugin-three-minify';

import { REVISION } from 'three';

import { rollup } from 'rollup';

const revision = Number(REVISION);

const resolvePlugin = nodeResolve();

/** @type {string} */
let globals = '';

await import('three').then((module) => {
  Object.entries({
    Revision: revision,
    ColorSpace: revision < 152 ? 'encoding' : 'colorSpace',
    sRGB: module[revision < 152 ? 'sRGBEncoding' : 'SRGBColorSpace'],
    OctetFormat: module[revision < 136 ? 'LuminanceFormat' : 'RedFormat'],
  }).map(([name, value]) => {
    const v = typeof value === 'string' ? `'${value}'` : value;
    globals += `window._${name} = ${v};\n`;
  });
});

/**
 * @param {string} name
 * @param {import('@brybrant/rollup-plugin-three-minify').UserOptions} options
 * @returns {import('rollup').RollupOptions} Rollup config options
 */
function createConfig(name, options) {
  return {
    input: `./test/src/${name}.js`,
    output: {
      banner: globals,
      file: `./test/dist/${name}.js`,
      format: 'iife',
      validate: true,
    },
    plugins: [
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
            <link href='../index.css' rel='stylesheet'/>
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

Promise.all(configs.map((config) => rollup(config)))
  .then((builds) => {
    /** @type {Promise<void>[]} */
    const finished = [];

    for (let i = 0; i < builds.length; i++) {
      const build = builds[i];

      build.write(configs[i].output).then(() => finished.push(build.close()));
    }

    return Promise.all(finished);
  })
  .finally(() => console.log('Finised!'));
