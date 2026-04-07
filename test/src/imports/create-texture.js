import { Texture } from 'three';

import { createImage } from './create-image';

/**
 * @callback LoadCallback
 * @param {Texture<HTMLCanvasElement>} texture
 */

/**
 * @param {string} svg Raw SVG as string
 * @param {number} width SVG width
 * @param {number} height SVG height
 * @param {LoadCallback} callback Callback to execute after image loading
 * @returns {Promise<Texture<HTMLCanvasElement>>} Texture
 */
export function createTexture(svg, width, height, callback) {
  return createImage(svg, width, height).then((canvas) => {
    const texture = new Texture(canvas);

    callback(texture);

    return import('three').then((module) => {
      if (window.REVISION < 152) {
        texture.encoding = module.sRGBEncoding;
      } else {
        texture.colorSpace = module.SRGBColorSpace;
      }
      texture.needsUpdate = true;
      return texture;
    });
  });
}
