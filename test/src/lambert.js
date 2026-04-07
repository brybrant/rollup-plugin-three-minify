import { MeshLambertMaterial } from 'three';

import { createScene } from './imports/app';
import { map } from './imports/create-map';

map.then((texture) => {
  createScene({
    label: 'MeshLambertMaterial\n+ emissiveMap',
    material: new MeshLambertMaterial({
      emissiveMap: texture,
      emissive: 0xff0000,
    }),
  });
});
