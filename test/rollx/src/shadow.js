import { MeshLambertMaterial } from 'three';

import { createScene, light, scene, renderer } from '../../app';
import { shadowPlane } from './imports/create-shadow-plane';

light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(0, 0, 0);
light.shadow.camera.top = light.shadow.camera.right = 10;
light.shadow.camera.bottom = light.shadow.camera.left = -10;
light.shadow.camera.near = 5;
light.shadow.camera.far = 40;
light.shadow.camera.updateProjectionMatrix();
light.castShadow = true;

scene.add(light);

renderer.shadowMap.enabled = true;

shadowPlane.then((plane) => {
  scene.add(plane);

  createScene({
    label: 'MeshLambertMaterial\n+ shadowMap\n+ bumpMap',
    material: new MeshLambertMaterial(),
  });
});
