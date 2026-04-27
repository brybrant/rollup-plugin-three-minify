import { MeshBasicMaterial } from 'three';

import { createScene, light, scene } from '../../app';
import { map } from './imports/create-map';

/** Test the `WebGLLights` stub console warning */
scene.add(light);

map.then((texture) => {
  createScene({
    label: 'MeshBasicMaterial\n+ map',
    material: new MeshBasicMaterial({ map: texture }),
  });
});
