import {
  includes,
  type IncludeName,
  features,
  type FeatureName,
  materials,
  type MaterialName,
  cubeMaterial,
  distanceMaterial,
  revision,
} from './const';

export interface Options {
  /**
   * ### Enable debug mode?
   * Useful in development (should be disabled in production)
   *
   * When enabled, pruned subsystems will emit a warnning if used and explain
   * how to change the plugin configuration to include the subsystem.
   */
  debug: boolean;

  /**
   * ### Include `THREE.Color.NAMES`?
   * @default false
   */
  colorKeywords: boolean;

  /**
   * ### Include `toJSON` and `fromJSON` methods on THREE classes?
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
   * ### Set of THREE includes to keep in the bundle **(whitelist)**
   * *(Includes not in this set will have shader code discarded!)*
   */
  includes: Set<IncludeName>;

  /**
   * ### Set of THREE materials to keep in the bundle **(whitelist)**
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
     * Inferred by the presence of `clipping_*` includes.
     * @default false
     */
    clipping: boolean;

    /**
     * ### Keep `WebGLEnvironments` subsystem?
     * `true` if your application uses materials with environment maps or
     * `Scene.environment` for physical materials.
     *
     * Inferred by the presence of `envmap_common_pars_fragment` include *OR*
     * when the `background` subsystem is also `true`.
     * @default false
     */
    environments: boolean;

    /**
     * ### Keep `WebGLLights` subsystem?
     * Set to `true` if your application uses light-responsive materials.
     *
     * Inferred by the presence of light-responsive materials *OR* when the
     * `shadows` subsystem is also `true`.
     * @default false
     */
    lights: boolean;

    /**
     * ### Keep `WebGLMorphtargets` subsystem?
     * `true` if your application uses morphtargets.
     *
     * Inferred by the presence of `morph*` includes.
     * @default false
     */
    morphtargets: boolean;

    /**
     * ### Keep `WebGLShadowMap` subsystem?
     * `true` if your application uses geometry which casts shadows.
     *
     * Inferred by the presence of `shadow*` includes *OR* the presence of the
     * `shadow` material.
     * @default false
     */
    shadowmap: boolean;

    /**
     * ### Keep `WebGLTextures` subsystem?
     * `true` if your application uses textures (like material maps).
     *
     * Inferred by the presence of `uv*` includes *OR* when any of the
     * following subsystems are also `true`:
     * - `background`
     * - `environment`
     * - `shadowmap`
     * @default false
     */
    textures: boolean;
  };
}

export interface UserOptions extends Partial<
  Omit<Options, 'includes' | 'materials' | 'subsystems'>
> {
  /**
   * ### Include `WebGLTextures` subsystem?
   * Set to `true` if your application needs to use textures.
   *
   * While the necessity of all other `WebGLRenderer` subsystems can simply be
   * derived from your selection of materials and features, this is not always
   * possible for the `WebGLTextures` subsystem. Therefore this option exists
   * in case you need to explicity include the subsystem (for example, if your
   * application uses render targets)
   */
  textures?: boolean;

  /**
   * ### THREE include(s) to keep in the bundle **(whitelist)**
   *
   * Most `includes` require other `includes` to function properly, therefore
   * it is recommended to use the `features` option instead for convenience.
   * @default []
   */
  includes?: IncludeName[] | IncludeName;

  /**
   * ### THREE feature(s) to keep in this bundle **(whitelist)**
   *
   * Each "feature" refers to a group of interdependent `includes` and is thus
   * a safer way to define the requirements of your application.
   * @default []
   */
  features?: FeatureName[] | FeatureName;

  /**
   * ### THREE material(s) to keep in the bundle **(whitelist)**
   *
   * Every THREE material (except `RawShaderMaterial`) requires a specific set
   * of `includes` to render.
   *
   * This plugin will keep only the essential `includes` for the material(s) in
   * this option.
   *
   * Some material features will fail silently unless you also specify them
   * in the `features` option.
   * @default []
   */
  materials?: MaterialName[] | MaterialName;
}

/**
 * `Object.hasown()`
 * @param object Target object
 * @param property Property to check
 * @returns `true` if `property` is a property of `object`
 */
function hasOwn<T extends object>(
  object: T,
  property: PropertyKey,
): property is keyof T {
  return Object.prototype.hasOwnProperty.call(object, property);
}

export const parseOptions = (options: UserOptions): Options => {
  const userIncludes: Set<IncludeName> = new Set();
  const userMaterials: Set<MaterialName> = new Set();

  /**
   * Add includes to `userIncludes` and materials to `userMaterials`
   * @param optionName Array property keys of `UserOptions`
   * @param optionValue Values of `optionName`
   * @param addOption Callback function to execute with `optionValue`
   */
  function parseOption<T extends string>(
    optionName: 'includes' | 'features' | 'materials',
    optionValue: T | T[] | undefined,
    addOption: (array: T[]) => void,
  ) {
    if (optionValue === undefined) return;

    if (typeof optionValue === 'string') {
      addOption([optionValue]);
      return;
    }

    if (Array.isArray(optionValue)) {
      addOption(optionValue);
      return;
    }

    throw new Error(
      `Invalid ${optionName} value: "${JSON.stringify(optionValue)}"`,
    );
  }

  /**
   * Adds each `include` of `includeArray` to `userIncludes` set.
   * @param includeArray Array of includes to keep in the bundle
   */
  function addIncludes(includeArray: readonly string[]) {
    for (const include of includeArray) {
      if (!hasOwn(includes, include)) {
        throw new Error(`Unrecognized include: "${include}"`);
      }

      const metadata = includes[include];

      switch (metadata.status) {
        case 'future':
          console.warn(
            `Include "${include}" is not available in THREE r${revision}. It was introduced in r${metadata.since}.`,
          );
          continue;

        case 'available':
          userIncludes.add(include);
          break;

        case 'deprecated':
          console.warn(
            `Include "${include}" was deprecated in THREE r${metadata.deprecated} and is not available in r${revision}.`,
          );
          break;
      }
    }
  }

  parseOption('includes', options.includes, addIncludes);

  /**
   * Adds `featureArray` includes to `userIncludes` set.
   * @param featureArray Array of features to keep in the bundle
   */
  function addFeatures(featureArray: readonly string[]): void {
    for (const feature of featureArray) {
      if (hasOwn(features, feature)) {
        for (const include of features[feature]) userIncludes.add(include);
        continue;
      }
      throw new Error(`Unrecognized feature: "${feature}"`);
    }
  }

  parseOption('features', options.features, addFeatures);

  /**
   * Adds each `material` of `materialArray` to `userMaterials` set.
   * Adds `materialArray` includes to `userIncludes` set.
   * @param materialArray Array of materials to keep in the bundle
   */
  function addMaterials(materialArray: readonly string[]): void {
    for (const material of materialArray) {
      if (!hasOwn(materials, material)) {
        throw new Error(`Unrecognized material: "${material}"`);
      }

      const metadata = materials[material];

      switch (metadata.status) {
        case 'future':
          console.warn(
            `Material "${material}" is not available in THREE r${revision}. It was introduced in r${metadata.since}.`,
          );
          continue;

        case 'available':
          userMaterials.add(material);
          for (const include of metadata.includes) userIncludes.add(include);
          break;

        case 'deprecated':
          console.warn(
            `Material "${material}" was deprecated in THREE r${metadata.deprecated} and is not available in r${revision}.`,
          );
          break;
      }
    }
  }

  parseOption('materials', options.materials, addMaterials);

  const subsystems: Options['subsystems'] = {
    background: false,
    clipping: false,
    environments: false,
    lights: false,
    morphtargets: false,
    shadowmap: false,
    textures: !!options.textures,
  };

  if (userMaterials.has('background') || userMaterials.has(cubeMaterial)) {
    subsystems.background =
      subsystems.environments =
      subsystems.textures =
        true;
  }

  if (
    userIncludes.has('clipping_planes_fragment') ||
    userIncludes.has('clipping_planes_pars_fragment') ||
    userIncludes.has('clipping_planes_pars_vertex') ||
    userIncludes.has('clipping_planes_vertex')
  ) {
    subsystems.clipping = true;
    addFeatures(['clipping']);
  }

  if (
    userIncludes.has('morphcolor_vertex') ||
    userIncludes.has('morphinstance_vertex') ||
    userIncludes.has('morphnormal_vertex') ||
    userIncludes.has('morphtarget_pars_vertex') ||
    userIncludes.has('morphtarget_vertex')
  ) {
    subsystems.morphtargets = true;
  }

  /** `WebGLShadowMap` uses `MeshDepthMaterial` and `MeshDistanceMaterial` */
  if (
    userIncludes.has('shadowmap_pars_fragment') ||
    userIncludes.has('shadowmap_pars_vertex') ||
    userIncludes.has('shadowmap_vertex') ||
    userIncludes.has('shadowmask_pars_fragment') ||
    userMaterials.has('shadow')
  ) {
    subsystems.lights = subsystems.shadowmap = subsystems.textures = true;
    addFeatures(['shadows']);
    addMaterials(['depth', distanceMaterial]);
  }

  /** Every material (except `RawShaderMaterial`) requires colorspace */
  if (userMaterials.size > 0) addFeatures(['colorspace']);

  /** Standard & Physical materials use the same vertex & fragment shaders */
  if (userMaterials.has('standard') || userMaterials.has('physical')) {
    addMaterials(['physical', 'standard']);
  }

  /** Many materials require light */
  if (
    /** Perhaps user wants THREE lights on `RawShaderMaterial`? */
    userIncludes.has('lights_pars_begin') ||
    subsystems.shadowmap ||
    userMaterials.has('lambert') ||
    userMaterials.has('phong') ||
    userMaterials.has('shadow') ||
    userMaterials.has('standard') ||
    userMaterials.has('toon')
  ) {
    subsystems.lights = true;
  }

  /** User requires environment maps on materials */
  if (
    subsystems.environments ||
    userIncludes.has('cube_uv_reflection_fragment') ||
    userIncludes.has('envmap_common_pars_fragment')
  ) {
    subsystems.environments = subsystems.textures = true;
    addFeatures(['envmap']);

    if (
      userMaterials.has('standard') ||
      userMaterials.has('lambert') ||
      userMaterials.has('phong')
    ) {
      addIncludes([
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
      addIncludes([
        'envmap_fragment',
        'envmap_pars_fragment',
        'envmap_pars_vertex',
        'envmap_vertex',
      ]);
    }
  }

  if (
    userIncludes.has('gradientmap_pars_fragment') ||
    userIncludes.has('transmission_fragment') ||
    userIncludes.has('transmission_pars_fragment') ||
    userIncludes.has('uv_pars_fragment') ||
    userIncludes.has('uv_pars_vertex') ||
    userIncludes.has('uv_vertex') ||
    userIncludes.has('uv2_pars_fragment') ||
    userIncludes.has('uv2_pars_vertex') ||
    userIncludes.has('uv2_vertex')
  ) {
    subsystems.textures = true;
  }

  return {
    debug: !!options.debug,
    colorKeywords: !!options.colorKeywords,
    jsonMethods: !!options.jsonMethods,
    xr: !!options.xr,
    subsystems,
    materials: userMaterials,
    includes: userIncludes,
  };
};
