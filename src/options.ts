import type {
  RuntimeMetadata,
  ChunkName,
  FeatureName,
  MaterialName,
  ThreeMetadata,
} from './const';

export interface Options {
  /**
   * ### Enable debug mode?
   * Useful in development *(should be disabled in production)*
   *
   * When enabled, pruned subsystems will emit a warning if used and explain
   * how to change the plugin configuration to include the subsystem.
   * @default false
   */
  debug: boolean;

  /**
   * ### Enable mangling?
   * When enabled, mutable GLSL identifiers will be mangled to further minify
   * GLSL code and improve compression.
   *
   * Set this option to `false` to help debug shader errors.
   *
   * Mangled identifiers will always match this regex: `_[a-zA-Z0-9]+`
   *
   * If you keep this option enabled, please avoid using identifiers which
   * start with an underscore (`_`) in your GLSL code to avoid naming conflicts.
   * @default true
   */
  mangle: boolean;

  /**
   * ### Include `THREE.Color.NAMES`?
   * Set this option to `true` if your application will create colors by name.
   * @default false
   */
  colorKeywords: boolean;

  /**
   * ### Include `toJSON` and `fromJSON` methods on Three.js classes?
   * Set this option to `true` if your application will use these JSON methods.
   * @default false
   */
  jsonMethods: boolean;

  /**
   * ### Keep `WebXRManager` subsystem?
   * Set this option to `true` if you are building an XR application.
   * @default false
   */
  xr: boolean;

  /**
   * ### Set of Three.js shader chunks to keep in the bundle **(whitelist)**
   * *(Chunks not in this set will have shader code discarded!)*
   */
  chunks: Set<ChunkName>;

  /**
   * ### Set of Three.js materials to keep in the bundle **(whitelist)**
   * *(Materials not in this set will have shader code discarded!)*
   */
  materials: Set<MaterialName>;

  subsystems: {
    /**
     * ### Keep `WebGLBackground` subsystem?
     * `true` if your application sets a `Texture` value on `Scene.background`.
     *
     * Inferred by the presence of `background` or `backgroundCube` materials.
     * @default false
     */
    background: boolean;

    /**
     * ### Keep `WebGLClipping` subsystem?
     * `true` if your application uses clipping planes.
     *
     * Inferred by the presence of the `clipping` feature or related chunks.
     * @default false
     */
    clipping: boolean;

    /**
     * ### Keep `WebGLEnvironments` subsystem?
     * `true` if your application uses environment maps.
     *
     * Inferred by the presence of the `envmap` feature or related chunks
     * *OR* when the `background` subsystem is also `true`.
     * @default false
     */
    environments: boolean;

    /**
     * ### Keep `WebGLLights` subsystem?
     * `true` if your application uses light-responsive materials.
     *
     * Inferred by the presence of light-related chunks/features/materials
     * *OR* when the `shadows` subsystem is also `true`.
     * @default false
     */
    lights: boolean;

    /**
     * ### Keep `WebGLMorphtargets` subsystem?
     * `true` if your application uses morphtargets.
     *
     * Inferred by the presence of the `morphtargets` feature or related chunks.
     * @default false
     */
    morphtargets: boolean;

    /**
     * ### Keep `WebGLShadowMap` subsystem?
     * `true` if your application uses geometry which casts shadows.
     *
     * Inferred by the presence of the `shadows` feature or related chunks.
     * @default false
     */
    shadowmap: boolean;

    /**
     * ### Keep `WebGLTextures` subsystem?
     * `true` if your application uses textures (such as material maps).
     *
     * Inferred by the presence of texture-related chunks/features
     * *OR* when any of the following subsystems are also `true`:
     * - `background`
     * - `environment`
     * - `shadowmap`
     * @default false
     */
    textures: boolean;
  };
}

export interface UserOptions extends Partial<
  Omit<Options, 'chunks' | 'materials' | 'subsystems'>
> {
  /**
   * Glob pattern(s) matching GLSL files to transform (mangle and minify)
   * @since 2.0.0
   * @default ['**\/*.glsl']
   */
  include?: string | string[];

  /**
   * Glob pattern(s) matching GLSL files to ignore
   * @since 2.0.0
   * @default []
   */
  exclude?: string | string[];

  /**
   * ### Include `WebGLTextures` subsystem?
   *
   * Set this option to `true` if your application uses textures in ways that
   * cannot be inferred by your selection of `materials` or `features`
   * (for example, if your application uses render targets or custom shaders).
   */
  textures?: boolean;

  /**
   * ### Three.js shader chunk(s) to keep in the bundle **(whitelist)**
   *
   * The word "chunks" refers to entries of `ShaderChunk`, which are pieces of
   * GLSL code injected into shaders at runtime via `#include <xyz>` directives
   * by `WebGLProgram`.
   *
   * Most `chunks` require other "sibling" `chunks` to function properly,
   * therefore it is recommended to use the `features` option instead for
   * convenience, but you can also use this option for more precise control.
   * @default []
   */
  chunks?: ChunkName[] | ChunkName;

  /**
   * ### Three.js feature(s) to keep in the bundle **(whitelist)**
   *
   * Each "feature" refers to a group of interdependent `chunks` and is thus
   * a safer way to define the requirements of your application.
   * @default []
   */
  features?: FeatureName[] | FeatureName;

  /**
   * ### Three.js material(s) to keep in the bundle **(whitelist)**
   *
   * Every Three.js material (except `RawShaderMaterial`) requires a specific
   * set of `chunks` to render, otherwise the renderer will crash.
   *
   * This plugin will keep only the necessary `chunks` for each material in
   * this option. Some optional material features will not work unless you
   * specify them in the `features` option.
   * @default []
   */
  materials?: MaterialName[] | MaterialName;
}

export const parseOptions = (
  options: UserOptions,
  metadata: ThreeMetadata,
): Options => {
  const { cubeMaterial, distanceMaterial, revision } = metadata;

  const userChunks: Set<ChunkName> = new Set();
  const userMaterials: Set<MaterialName> = new Set();

  const subsystems: Options['subsystems'] = {
    background: false,
    clipping: false,
    environments: false,
    lights: false,
    morphtargets: false,
    shadowmap: false,
    textures: !!options.textures,
  };

  type OptionName = 'chunks' | 'features' | 'materials';

  /**
   * Helper to convert `OptionName` properties of `UserOptions` to arrays
   * @param optionName `OptionName`
   * @param optionValue `UserOptions[OptionName]`
   * @returns Array of `optionValue`
   */
  function parseOption<T extends string>(
    optionName: OptionName,
    optionValue: T | T[] | undefined,
  ): readonly T[] {
    if (optionValue === undefined) return [];

    if (typeof optionValue === 'string') return [optionValue];

    if (!Array.isArray(optionValue)) {
      throw new Error(
        `Invalid ${optionName} option value: "${JSON.stringify(optionValue)}"`,
      );
    }

    return optionValue;
  }

  const parsedChunks = parseOption('chunks', options.chunks);

  const parsedFeatures = parseOption('features', options.features);

  const parsedMaterials = parseOption('materials', options.materials);

  type OptionSource = Record<string, RuntimeMetadata | undefined>;

  /**
   * Add chunks to `userChunks` and materials to `userMaterials`
   * @param optionName Array property keys of `UserOptions`
   * @param optionValue Values of `optionName`
   */
  function addOption(optionName: OptionName, optionValue: readonly string[]) {
    const optionSource = metadata[optionName] as OptionSource;

    for (const value of optionValue) {
      const valueMetadata = optionSource[value];

      if (valueMetadata === undefined) {
        throw new Error(
          `Unrecognized value in '${optionName}' option: "${value}"`,
        );
      }

      switch (valueMetadata.status) {
        case 'future':
          console.warn(
            `${optionName} value "${value}" is not available in Three.js r${revision}. It was introduced in r${valueMetadata.since}`,
          );
          break;

        case 'available':
          if (valueMetadata.chunks) {
            for (const chunk of valueMetadata.chunks) {
              const chunkMetadata = metadata.chunks[chunk];

              if (chunkMetadata.status === 'available') userChunks.add(chunk);
            }
          }

          if (valueMetadata.subsystems) {
            for (const subsystem of valueMetadata.subsystems) {
              subsystems[subsystem] = true;
            }
          }

          switch (optionName) {
            case 'chunks':
              userChunks.add(value as ChunkName);
              break;

            case 'materials':
              userMaterials.add(value as MaterialName);
          }
          break;

        case 'deprecated':
          console.warn(
            `${optionName} value "${value}" was deprecated in Three.js r${valueMetadata.deprecated} and is not available in r${revision}.`,
          );
      }
    }
  }

  addOption('chunks', parsedChunks);

  addOption('features', parsedFeatures);

  addOption('materials', parsedMaterials);

  if (userMaterials.has('background') || userMaterials.has(cubeMaterial)) {
    subsystems.background = true;
  }

  if (subsystems.background) subsystems.environments = true;

  if (subsystems.clipping) addOption('features', ['clipping']);

  if (subsystems.morphtargets) addOption('features', ['morphtargets']);

  if (subsystems.shadowmap) {
    subsystems.lights = subsystems.textures = true;
    addOption('features', ['shadows']);
    /** `WebGLShadowMap` uses `MeshDepthMaterial` and `MeshDistanceMaterial` */
    addOption('materials', ['depth', distanceMaterial]);
  }

  /** Every material (except `RawShaderMaterial`) requires colorspace */
  if (userMaterials.size > 0) addOption('features', ['colorspace']);

  /**
   * - `MeshStandardMaterial` uses `MeshPhysicalMaterial` shaders
   * - Both of these materials are internally interdependant
   */
  if (userMaterials.has('physical') || userMaterials.has('standard')) {
    addOption('materials', ['physical', 'standard']);
  }

  /** User requires environment maps on materials */
  if (subsystems.environments) {
    subsystems.textures = true;
    addOption('features', ['envmap']);

    if (
      userMaterials.has('standard') ||
      userMaterials.has('lambert') ||
      userMaterials.has('phong')
    ) {
      addOption('chunks', [
        'cube_uv_reflection_fragment',
        'envmap_physical_pars_fragment',
        'lights_fragment_maps',
      ]);
    }

    if (
      userMaterials.has('basic') ||
      userMaterials.has('lambert') ||
      userMaterials.has('phong')
    ) {
      addOption('chunks', [
        'envmap_fragment',
        'envmap_pars_fragment',
        'envmap_pars_vertex',
        'envmap_vertex',
      ]);
    }
  }

  return {
    debug: !!options.debug,
    mangle: options.mangle !== false,
    colorKeywords: !!options.colorKeywords,
    jsonMethods: !!options.jsonMethods,
    xr: !!options.xr,
    subsystems,
    materials: userMaterials,
    chunks: userChunks,
  };
};
