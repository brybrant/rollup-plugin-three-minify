import { DataTexture, MeshToonMaterial } from 'three';

import { createScene, light, scene } from './app.ts';
import { map } from './imports/create-map.ts';

scene.add(light);

const colors = new Uint8Array(4);

for (let c = 0; c <= colors.length; c++) {
  colors[c] = Math.min((c + 1) / colors.length, 1) * 255;
}

void map.then((texture) => {
  /** Test the `WebGLBackground` stub console warning */
  scene.background = texture;

  const gradientMap = new DataTexture(
    colors,
    colors.length,
    1,
    window._OctetFormat,
  );
  gradientMap.needsUpdate = true;

  createScene({
    label: 'MeshToonMaterial\n+ gradientMap',
    material: new MeshToonMaterial({ gradientMap }),
  });
});
