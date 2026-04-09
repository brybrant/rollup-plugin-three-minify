import { MeshBasicMaterial } from 'three';

import { createScene } from '../../app';
import { map } from './imports/create-map';

map.then((texture) => {
  createScene({
    label: 'MeshBasicMaterial\n+ map',
    material: new MeshBasicMaterial({ map: texture }),
  });
});
