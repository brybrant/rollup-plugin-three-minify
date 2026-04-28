import { BackSide, PlaneGeometry, Mesh, MeshPhongMaterial } from 'three';

import { map } from './create-map';

export const shadowPlane = map.then((bumpMap) => {
  const geometry = new PlaneGeometry(128, 8); // Texture is 16:1

  const material = new MeshPhongMaterial({
    bumpMap,
    side: BackSide,
  });

  const plane = new Mesh(geometry, material);

  plane.position.setZ(2);

  plane.receiveShadow = true;

  return plane;
});
