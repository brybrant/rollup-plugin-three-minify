import { MeshPhysicalMaterial } from 'three';

import { createScene, light, scene } from '../../app';

scene.add(light);

/**
 * The `WebGLTextures` warning is only emitted since r180 because the "envmap"
 * uniform includes the DFG LUT, which is a `DataTexture`. This is fine because
 * it does nothing without "envmap" feature, in which case that subsystem stub
 * will also emit a warning.
 */
createScene({
  label: 'MeshPhysicalMaterial',
  material: new MeshPhysicalMaterial({
    metalness: 0.5,
    roughness: 0.25,
  }),
});
