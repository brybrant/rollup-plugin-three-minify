import { MeshPhongMaterial } from 'three';

import { createScene, light, renderer, scene } from '../../app';
import { equirect } from './imports/create-equirect';
import { map } from './imports/create-map';

scene.add(light);

/** Test the `WebXRManager` stub console warning */
renderer.xr.enabled = true;

Promise.all([equirect, map]).then(([envMap, lightMap]) => {
  createScene({
    label: 'MeshPhongMaterial\n+ envMap (equirectangular)\n+ lightMap',
    material: new MeshPhongMaterial({
      envMap,
      lightMap,
    }),
  });
});
