import { MeshBasicMaterial } from 'three';

import { createScene } from './imports/app';
import { map } from './imports/create-map';

map.then((texture) => {
  createScene({
    label: 'MeshBasicMaterial\n+ map',
    material: new MeshBasicMaterial({ map: texture }),
  });
});
