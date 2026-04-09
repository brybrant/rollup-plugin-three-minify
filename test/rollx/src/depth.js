import { MeshDepthMaterial } from 'three';

import { createScene } from '../../app';
import { map } from './imports/create-map';

map.then((texture) => {
  createScene({
    label: 'MeshDepthMaterial\n+ alphaMap\n+ alphaTest',
    material: new MeshDepthMaterial({
      alphaMap: texture,
      alphaTest: 0.5,
    }),
  });
});
