/**
 * Only run this script from the root directory by using `npm run vite`
 */

import { build } from 'vite';

import threeMinifyPlugin from 'rollup-plugin-three-minify';

import { globalPlugin } from './global-plugin.js';

await build({
  base: './',
  build: {
    lib: {
      entry: './src/index.js',
      formats: ['es'],
      fileName: 'index',
    },
    minify: false,
  },
  plugins: [
    globalPlugin,
    threeMinifyPlugin({
      debug: true,
      materials: 'physical',
    }),
  ],
  root: './test/vite',
});
