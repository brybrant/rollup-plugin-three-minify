import { NearestFilter, RepeatWrapping } from 'three';

import { createTexture } from './create-texture';

const svg = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'>
  <path fill='#000' d='M0,0H1V2H2V1H0'/>
  <path fill='#fff' d='M0,1H2V0H1V2H0'/>
</svg>
`;

export const map = createTexture(svg, 128, 128, (texture) => {
  texture.minFilter = texture.magFilter = NearestFilter;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(128, 8);
});
