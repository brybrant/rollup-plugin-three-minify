import { MeshNormalMaterial } from 'three';

import { createScene, renderer } from '../../app';
import { map } from './imports/create-map';

/** Test the `WebGLClipping` stub console warning */
renderer.localClippingEnabled = true;

map.then((texture) => {
  createScene({
    label: 'MeshNormalMaterial\n+ normalMap\n+ dithering',
    material: new MeshNormalMaterial({
      dithering: true,
      normalMap: texture,
    }),
  });
});
