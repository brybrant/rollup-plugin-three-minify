import { Color, ShaderMaterial } from 'three';

import { createScene } from '../../app';

import vertexShader from './imports/vertex.glsl';
import fragmentShader from './imports/fragment.glsl';

createScene({
  label: 'ShaderMaterial\n(Custom GLSL)',
  material: new ShaderMaterial({
    dithering: true,
    uniforms: {
      diffuse: {
        value: new Color(0),
      },
      opacity: {
        value: 1.0,
      },
    },
    vertexShader,
    fragmentShader,
  }),
});
