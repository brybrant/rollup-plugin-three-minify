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

  /**
   * Used for the `Texture.encoding` property value
   * @deprecated 0.152.0
   */
  export const sRGBEncoding: 3001;

  /**
   * Used for the `Texture.colorSpace` property value
   * @since 0.152.0
   */
  export const SRGBColorSpace: 'srgb';

  /**
   * Used for the `Texture.format` property value of monochromatic textures
   * (such as the `MeshToonMaterial.gradientMap` property) in Three.js
   * revisions before 136
   */
  export const LuminanceFormat: 1024;

  /**
   * Used for the `Texture.format` property value of monochromatic textures
   * (such as the `MeshToonMaterial.gradientMap` property) in Three.js
   * revisions after 135
   */
  export const RedFormat: 1028;

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
