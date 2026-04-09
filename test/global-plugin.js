import { REVISION } from 'three';

export const revision = Number(REVISION);

/** @type {import('rollup').Plugin} */
export const globalPlugin = {
  name: '@brybrant/global-plugin',
  banner: {
    order: 'pre',
    async handler() {
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

      return globals;
    },
  },
};
