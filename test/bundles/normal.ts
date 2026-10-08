import { MeshNormalMaterial } from 'three';

import { createScene, renderer } from './app.ts';
import { map } from './imports/create-map.ts';

/** Test the `WebGLClipping` stub console warning */
renderer.localClippingEnabled = true;

void map.then((normalMap) => {
  createScene({
    label: 'MeshNormalMaterial\n+ normalMap\n+ dithering',
    material: new MeshNormalMaterial({
      dithering: true,
      normalMap,
    }),
  });
});
