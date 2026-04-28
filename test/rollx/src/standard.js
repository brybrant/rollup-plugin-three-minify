import { MeshStandardMaterial } from 'three';

import { createScene, geometry, light, scene } from '../../app';
import { cube } from './imports/create-cube';

/** Test the `WebGLMorphtargets` stub console warning */
geometry.morphAttributes.position = [];

scene.add(light);

cube.then((envMap) => {
  createScene({
    label: 'MeshStandardMaterial\n+ envMap (cube)',
    material: new MeshStandardMaterial({
      envMap,
      metalness: 0.5,
      roughness: 0.25,
    }),
  });
});
