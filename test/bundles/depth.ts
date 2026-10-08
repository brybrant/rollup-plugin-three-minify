import { MeshDepthMaterial } from 'three';

import { createScene } from './app.ts';
import { map } from './imports/create-map.ts';

void map.then((alphaMap) => {
  createScene({
    label: 'MeshDepthMaterial\n+ alphaMap\n+ alphaTest',
    material: new MeshDepthMaterial({
      alphaMap,
      alphaTest: 0.5,
    }),
  });
});
