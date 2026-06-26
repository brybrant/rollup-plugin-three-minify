declare module 'three' {
  import type { MaterialName } from 'rollup-plugin-three-minify';

  /**
   * `REVISION` is a number in a string.
   *
   * This refers to the current (semver) "MINOR" version of Three.js installed.
   * For example, if `0.150.1` is installed, then `REVISION` will be "150".
   *
   * This plugin is backwards-compatible with Three.js revisions down to 135.
   * It might work with earlier revisions but I will not guarantee that.
   */
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
