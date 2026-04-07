import {
  includes,
  type IncludeName,
  features,
  type FeatureName,
  materials,
  type MaterialName,
  distanceMaterial,
} from './const';

export interface Options {
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
   * ### Include background stuff?
   * Set to `true` if your application sets a value on `Scene.background`.
   * @default false
   */
  background: boolean;

  /**
   * ### Include clipping stuff?
   * Set to `true` if your application uses clipping planes.
   * @default false
   */
  clipping: boolean;

  /**
   * ### Include environment stuff?
   * Set to `true` if your application uses materials with environment maps,
   * `PMREMGenerator` or `Scene.environment` for physical materials.
   * @default false
   */
  environment: boolean;

  /**
   * ### Include shadow stuff?
   * Set to `true` if your application uses materials which cast shadows.
   * @default false
   */
  shadows: boolean;

  /**
   * ### Include texture stuff?
   * Set to `true` if your application uses textures (like material maps).
   * @default false
   */
  textures: boolean;

  /**
   * ### Include XR stuff?
   * Set to `true` if your application uses THREE's WebXR stuff.
   * @default false
   */
  xr: boolean;

  /**
   * Set of THREE includes to keep in the bundle **(whitelist)**
   *
   * *(Includes not in this set will have shader code discarded!)*
   */
  includes: Set<IncludeName>;

  /**
   * Set of THREE materials to keep in the bundle **(whitelist)**
   *
   * *(Materials not in this set will have shader code discarded!)*
   */
  materials: Set<MaterialName>;
}

export interface UserOptions extends Partial<
  Omit<Options, 'materials' | 'includes'>
> {
  /**
   * ### THREE include(s) to keep in the bundle **(whitelist)**
   *
   * Most `includes` depend on other `includes` to function properly, therefore
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
   * Most material features will fail silently unless you also specify them
   * in the `features` option.
   * @default []
   */
  materials?: MaterialName[] | MaterialName;
}

const includeSet = new Set(includes);

/**
 * @param object Target object
 * @param property Property to check
 * @returns `true` if `property` is a property of `object`
 */
function hasOwn(object: object, property: string) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

export const parseOptions = (options: UserOptions): Options => {
  const userIncludes: Set<IncludeName> = new Set();

  const userMaterials: Set<MaterialName> = new Set();

  /**
   * Adds each `include` of `includeArray` to `userIncludes` set.
   * @param includeArray Array of includes to keep in the bundle
   */
  function addIncludes(includeArray: IncludeName[]): void {
    for (const include of includeArray) {
      if (includeSet.has(include)) {
        userIncludes.add(include);
        continue;
      }
      throw new Error(`Unrecognized include: "${include}"`);
    }
  }

  if (options.includes !== undefined) {
    if (Array.isArray(options.includes)) {
      addIncludes(options.includes);
    } else if (typeof options.includes === 'string') {
      addIncludes([options.includes]);
    } else {
      throw new Error(
        `Invalid includes value: "${JSON.stringify(options.includes)}"`,
      );
    }
  }

  /**
   * Adds `featureArray` includes to `userIncludes` set.
   * @param featureArray Array of features to keep in the bundle
   */
  function addFeatures(featureArray: FeatureName[]): void {
    for (const feature of featureArray) {
      if (hasOwn(features, feature)) {
        addIncludes(features[feature]);
        continue;
      }
      throw new Error(`Unrecognized feature: "${feature}"`);
    }
  }

  if (options.features !== undefined) {
    if (Array.isArray(options.features)) {
      addFeatures(options.features);
    } else if (typeof options.features === 'string') {
      addFeatures([options.features]);
    } else {
      throw new Error(
        `Invalid features value: "${JSON.stringify(options.features)}`,
      );
    }
  }

  /**
   * Adds `materialArray` to `userMaterials` set.
   * Adds `materialArray` includes to `userIncludes` set.
   * @param materialArray Array of materials to keep in the bundle
   */
  function addMaterials(materialArray: MaterialName[]): void {
    for (const material of materialArray) {
      if (hasOwn(materials, material)) {
        userMaterials.add(material);
        addIncludes(materials[material]);
        continue;
      }
      throw new Error(`Unrecognized material: "${material}"`);
    }
  }

  if (options.materials !== undefined) {
    if (Array.isArray(options.materials)) {
      addMaterials(options.materials);
    } else if (typeof options.materials === 'string') {
      addMaterials([options.materials]);
    } else {
      throw new Error(
        `Invalid materials value: "${JSON.stringify(options.materials)}"`,
      );
    }
  }

  const background = !!options.background;

  let clipping = !!options.clipping;

  let environment = !!options.environment;

  let shadows = !!options.shadows;

  let textures = !!options.textures;

  if (background) textures = true;

  if (clipping || userIncludes.has('clipping_planes_vertex')) {
    clipping = true;
    addFeatures(['clipping']);
  }

  /** `WebGLShadowMap` uses `MeshDepthMaterial` and `MeshDistanceMaterial` */
  if (shadows || userIncludes.has('shadowmap_vertex')) {
    shadows = true;
    textures = true;
    addFeatures(['shadows']);
    addMaterials(['depth', distanceMaterial, 'shadow']);
  }

  /** Every material (except `RawShaderMaterial`) requires these */
  if (userMaterials.size > 0) addFeatures(['colorspace']);

  /** Standard and Physical materials use the same vertex & fragment shaders */
  if (userMaterials.has('standard') || userMaterials.has('physical')) {
    addMaterials(['physical', 'standard']);
  }

  /** User requires environment maps on materials */
  if (environment || userIncludes.has('envmap_common_pars_fragment')) {
    environment = true;
    textures = true;
    addFeatures(['envmap']);

    if (
      userMaterials.has('standard') ||
      userMaterials.has('lambert') ||
      userMaterials.has('phong')
    ) {
      addIncludes(['envmap_physical_pars_fragment', 'lights_fragment_maps']);
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

  return {
    colorKeywords: !!options.colorKeywords,
    jsonMethods: !!options.jsonMethods,
    clipping,
    background,
    environment,
    shadows,
    textures,
    xr: !!options.xr,
    materials: userMaterials,
    includes: userIncludes,
  };
};
