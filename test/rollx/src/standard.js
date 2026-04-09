import { MeshStandardMaterial } from 'three';

import { createScene } from '../../app';
import { cube } from './imports/create-cube';

cube.then((texture) => {
  createScene({
    label: 'MeshStandardMaterial\n+ envMap (cube)',
    material: new MeshStandardMaterial({
      envMap: texture,
      metalness: 0.5,
      roughness: 0.25,
    }),
  });
});
