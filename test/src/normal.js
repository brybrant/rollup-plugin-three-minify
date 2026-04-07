import { MeshNormalMaterial } from 'three';

import { createScene } from './imports/app';
import { map } from './imports/create-map';

map.then((texture) => {
  createScene({
    label: 'MeshNormalMaterial\n+ normalMap\n+ dithering',
    material: new MeshNormalMaterial({
      dithering: true,
      normalMap: texture,
    }),
  });
});
