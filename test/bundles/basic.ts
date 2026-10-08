import { MeshBasicMaterial } from 'three';

import { createScene, light, scene } from './app.ts';
import { map } from './imports/create-map.ts';

/** Test the `WebGLLights` stub console warning */
scene.add(light);

void map.then((map) => {
  createScene({
    label: 'MeshBasicMaterial\n+ map',
    material: new MeshBasicMaterial({ map }),
  });
});
