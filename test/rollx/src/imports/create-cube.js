import { CubeTexture } from 'three';

import { createImage } from './create-image';

const squareSVG = (color) => `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='${color}'/>
</svg>
`;

/** Creates a `CubeTexture` (environment map) */
export const cube = Promise.all([
  createImage(/** +X */ squareSVG('#f00'), 256, 256),
  createImage(/** -X */ squareSVG('#0ff'), 256, 256),
  createImage(/** +Y */ squareSVG('#0f0'), 256, 256),
  createImage(/** -Y */ squareSVG('#f0f'), 256, 256),
  createImage(/** +Z */ squareSVG('#00f'), 256, 256),
  createImage(/** -Z */ squareSVG('#ff0'), 256, 256),
]).then((images) => {
  const texture = new CubeTexture(images);

  texture[window._ColorSpace] = window._sRGB;
  texture.needsUpdate = true;
  return texture;
});
