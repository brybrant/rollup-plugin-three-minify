declare module 'three' {
  import type { MaterialName } from 'rollup-plugin-three-minify';

  export const REVISION: string;

  export const ShaderChunk: Record<string, string>;

  export const ShaderLib: Record<
    MaterialName,
    { vertexShader: string; fragmentShader: string }
  >;

  export const UniformsLib: {
    [uniformGroup: string]: {
      [uniformName: string]: {
        value: unknown;
        properties?: {
          [property: string]: unknown;
        };
      };
    };
  };
}
