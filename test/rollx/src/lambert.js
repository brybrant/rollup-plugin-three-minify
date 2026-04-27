import { Color, MeshLambertMaterial } from 'three';

import { createScene, light, scene } from '../../app';
import { map } from './imports/create-map';

scene.add(light);

scene.background = new Color(0x00ff00);

map.then((texture) => {
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
