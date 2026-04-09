import { EquirectangularReflectionMapping } from 'three';

import { createTexture } from './create-texture';

const svg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 4'>
  <defs>
    <filter id='a'>
      <feTurbulence baseFrequency='4' numOctaves='2' stitchTiles='stitch'/>
    </filter>
  </defs>
  <path d='M0,0v4h8V0H0' filter='url(#a)'/>
</svg>
`;

export const equirect = createTexture(svg, 512, 256, (texture) => {
  texture.mapping = EquirectangularReflectionMapping;
});
