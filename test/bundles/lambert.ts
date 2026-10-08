import { Color, MeshLambertMaterial } from 'three';

import { createScene, light, scene } from './app.ts';
import { map } from './imports/create-map.ts';

scene.add(light);

scene.background = new Color(0x00ff00);

void map.then((texture) => {
  createScene({
    label: 'MeshLambertMaterial\n+ emissiveMap',
    material: new MeshLambertMaterial({
      emissiveMap: texture,
      emissive: 0xff0000,
      /** Test the `WebGLCubeMaps / WebGLEnvironments` stub console warning */
      envMap: texture,
    }),
  });
});
