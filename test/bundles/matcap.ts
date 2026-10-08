import { MeshMatcapMaterial } from 'three';

import { createScene } from './app.ts';
import { equirect } from './imports/create-equirect.ts';

void equirect.then((matcap) => {
  createScene({
    label: 'MeshMatcapMaterial',
    material: new MeshMatcapMaterial({ matcap }),
  });
});
