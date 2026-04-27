import { MeshPhongMaterial } from 'three';

import { createScene, light, renderer, scene } from '../../app';
import { equirect } from './imports/create-equirect';

scene.add(light);

/** Test the `WebXRManager` stub console warning */
renderer.xr.enabled = true;

equirect.then((texture) => {
  createScene({
    label: 'MeshPhongMaterial\n+ envMap (equirectangular)',
    material: new MeshPhongMaterial({
      envMap: texture,
    }),
  });
});
