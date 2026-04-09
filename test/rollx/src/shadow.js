import { MeshLambertMaterial } from 'three';

import { createScene } from '../../app';
import { shadowPlane } from './imports/create-shadow-plane';

shadowPlane.then((plane) => {
  createScene({
    callback: (scene, renderer) => {
      renderer.shadowMap.enabled = true;
      scene.add(plane);
    },
    label: 'MeshLambertMaterial\n+ shadowMap\n+ bumpMap',
    material: new MeshLambertMaterial(),
  });
});
