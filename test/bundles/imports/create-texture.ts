import { Texture } from 'three';

import { createImage } from './create-image.ts';

type LoadCallback = (texture: Texture<HTMLCanvasElement>) => void;

/**
 * @param svg Raw SVG as string
 * @param width SVG width
 * @param height SVG height
 * @param callback Callback to execute after image loading
 * @returns Texture
 */
export async function createTexture(
  svg: string,
  width: number,
  height: number,
  callback: LoadCallback,
) {
  return createImage(svg, width, height).then((canvas) => {
    const texture = new Texture(canvas);

    callback(texture);

    texture[window._ColorSpace] = window._sRGB;
    texture.needsUpdate = true;
    return texture;
  });
}
