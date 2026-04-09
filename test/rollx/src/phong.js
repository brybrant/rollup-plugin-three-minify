import { MeshPhongMaterial } from 'three';

import { createScene } from '../../app';
import { equirect } from './imports/create-equirect';

equirect.then((texture) => {
  createScene({
    label: 'MeshPhongMaterial\n+ envMap (equirectangular)',
    material: new MeshPhongMaterial({
      envMap: texture,
    }),
  });
});
