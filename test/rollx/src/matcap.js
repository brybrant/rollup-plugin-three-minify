import { MeshMatcapMaterial } from 'three';

import { createScene } from '../../app';
import { equirect } from './imports/create-equirect';

equirect.then((matcap) => {
  createScene({
    label: 'MeshMatcapMaterial',
    material: new MeshMatcapMaterial({ matcap }),
  });
});
