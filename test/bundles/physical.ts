import { MeshPhysicalMaterial } from 'three';

import { createScene, light, scene } from './app.ts';
import { equirect } from './imports/create-equirect.ts';

/** Test the `WebGLShadowMap` stub console warning */
light.castShadow = true;

scene.add(light);

void equirect.then((texture) => {
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
