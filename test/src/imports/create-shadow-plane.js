import { BackSide, PlaneGeometry, Mesh, MeshPhongMaterial } from 'three';

import { map } from './create-map';

export const shadowPlane = map.then((texture) => {
  const geometry = new PlaneGeometry(640, 40);

  const material = new MeshPhongMaterial({
    bumpMap: texture,
    side: BackSide,
  });

  const mesh = new Mesh(geometry, material);

  mesh.position.set(0, 0, 10);

  mesh.receiveShadow = true;

  return mesh;
});
