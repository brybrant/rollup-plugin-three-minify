import { CubeTexture } from 'three';

import { createImage } from './create-image';

const xP = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#f00'/>
</svg>
`;
const xN = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#0ff'/>
</svg>
`;
const yP = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#0f0'/>
</svg>
`;
const yN = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#f0f'/>
</svg>
`;
const zP = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#00f'/>
</svg>
`;
const zN = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'>
  <path d='M0,0v1h1V0H0' fill='#ff0'/>
</svg>
`;

/** Creates a `CubeTexture` (environment map) */
export const cube = Promise.all([
  createImage(xP, 256, 256),
  createImage(xN, 256, 256),
  createImage(yP, 256, 256),
  createImage(yN, 256, 256),
  createImage(zP, 256, 256),
  createImage(zN, 256, 256),
]).then((images) => {
  const texture = new CubeTexture(images);
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
