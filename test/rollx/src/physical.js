import { MeshPhysicalMaterial } from 'three';

import { createScene, light, scene } from '../../app';
import { equirect } from './imports/create-equirect';

/** Test the `WebGLShadowMap` stub console warning */
light.castShadow = true;

scene.add(light);

equirect.then((texture) => {
  scene.background = scene.environment = texture;

  createScene({
    label:
      'MeshPhysicalMaterial\n+ Scene.background\n+ Scene.environment (equirectangular)',
    material: new MeshPhysicalMaterial({
      metalness: 1,
      roughness: 0.25,
    }),
  });
});
