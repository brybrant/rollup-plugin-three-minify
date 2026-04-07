import { MeshPhysicalMaterial } from 'three';

import { createScene } from './imports/app';
import { equirect } from './imports/create-equirect';

equirect.then((texture) => {
  createScene({
    callback: (scene) => {
      scene.background = scene.environment = texture;
    },
    label:
      'MeshPhysicalMaterial\n+ Scene.background\n+ Scene.environment (equirectangular)',
    material: new MeshPhysicalMaterial({
      metalness: 1,
      roughness: 0.25,
    }),
  });
});
