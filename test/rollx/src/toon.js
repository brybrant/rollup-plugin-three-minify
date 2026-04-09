import { DataTexture, MeshToonMaterial } from 'three';

import { createScene } from '../../app';
import { map } from './imports/create-map';

const colors = new Uint8Array(4);

for (let c = 0; c <= colors.length; c++) {
  colors[c] = Math.min((c + 1) / colors.length, 1) * 255;
}

map.then((texture) => {
  const gradientMap = new DataTexture(
    colors,
    colors.length,
    1,
    window._OctetFormat,
  );
  gradientMap.needsUpdate = true;

  createScene({
    label: 'MeshToonMaterial\n+ gradientMap\n+ lightMap',
    material: new MeshToonMaterial({
      gradientMap: gradientMap,
      lightMap: texture,
    }),
  });
});
