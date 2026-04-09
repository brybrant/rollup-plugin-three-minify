import { MeshPhysicalMaterial } from 'three';

import { createScene } from '../../app';

createScene({
  label: 'MeshPhysicalMaterial',
  material: new MeshPhysicalMaterial({
    metalness: 1,
    roughness: 0.25,
  }),
});
