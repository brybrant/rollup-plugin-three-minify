import { DataTexture, MeshToonMaterial } from 'three';

import { createScene } from './imports/app';
import { map } from './imports/create-map';

const colors = new Uint8Array(4);

for (let c = 0; c <= colors.length; c++) {
  colors[c] = Math.min((c + 1) / colors.length, 1) * 255;
}

Promise.all([map, import('three')]).then(([texture, module]) => {
  const gradientMap = new DataTexture(
    colors,
    colors.length,
    1,
    window.REVISION < 136 ? module.LuminanceFormat : module.RedFormat,
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
