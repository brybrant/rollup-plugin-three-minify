// @ts-expect-error No declaration (`REVISION` is a number in a string)
import { REVISION } from 'three';

/**
 * This refers to the current (semver) "MINOR" version of Three.js installed.
 * For example, if `0.150.1` is installed, then `revision` will be `150`.
 *
 * This plugin is backwards-compatible with Three.js revisions down to 135.
 * It might work with earlier revisions but I will not guarantee that.
 */
export const revision = Number(REVISION);

/**
 * `String.replace()` callback function
 * @param match The matched string (`$&`)
 * @param groups Capture groups
 * @returns Transformed string
 */
export type Replacer = (match: string, ...groups: string[]) => string;

type Metadata = {
  /** `THREE.REVISION` of addition (assumes available since the beginning) */
  readonly since?: number;
  /** `THREE.REVISION` of removal (assumes never deprecated) */
  readonly deprecated?: number;
};

type RuntimeMetadata = Metadata & {
  /**
   * - `future` = `revision < since`
   * - `available` = `revision >= since && revision < deprecated`
   * - `deprecated` = `revision >= deprecated`
   */
  readonly status: 'future' | 'available' | 'deprecated';
};

/**
 * Derives the value of `status` for each object entry at runtime
 * @param record Object with values of `Metadata`
 * @returns Object with `status` property added to each value
 */
function computeStatus<T extends Record<string, Metadata & object>>(record: T) {
  const result = {} as { [K in keyof T]: T[K] & RuntimeMetadata };

  for (const key in record) {
    const metadata = record[key];

    const since = metadata.since ?? -Infinity;
    const deprecated = metadata.deprecated ?? Infinity;

    let status: RuntimeMetadata['status'];

    if (revision < since) {
      status = 'future';
    } else if (revision >= deprecated) {
      status = 'deprecated';
    } else {
      status = 'available';
    }

    result[key] = { ...metadata, status };
  }

  return result;
}

/**
 * Basically `THREE.ShaderChunk` with some metadata (minus material shaders)
 *
 * These "chunks" are injected into material shaders via `#include <shader>`
 * GLSL directives.
 *
 * Check {@link materials} for material shaders.
 */
export const includes = computeStatus({
  alphahash_fragment: { since: 154 },
  alphahash_pars_fragment: { since: 154 },
  alphamap_fragment: {},
  alphamap_pars_fragment: {},
  alphatest_fragment: {},
  alphatest_pars_fragment: {},
  aomap_fragment: {},
  aomap_pars_fragment: {},
  batching_pars_vertex: { since: 159 },
  batching_vertex: { since: 159 },
  begin_vertex: {},
  beginnormal_vertex: {},
  bsdfs: {},
  bumpmap_pars_fragment: {},
  clearcoat_normal_fragment_begin: {},
  clearcoat_normal_fragment_maps: {},
  clearcoat_pars_fragment: {},
  clipping_planes_fragment: {},
  clipping_planes_pars_fragment: {},
  clipping_planes_pars_vertex: {},
  clipping_planes_vertex: {},
  color_fragment: {},
  color_pars_fragment: {},
  color_pars_vertex: {},
  color_vertex: {},
  colorspace_fragment: { since: 154 },
  colorspace_pars_fragment: { since: 154 },
  common: {},
  cube_uv_reflection_fragment: {},
  defaultnormal_vertex: {},
  displacementmap_pars_vertex: {},
  displacementmap_vertex: {},
  dithering_fragment: {},
  dithering_pars_fragment: {},
  emissivemap_fragment: {},
  emissivemap_pars_fragment: {},
  /** Renamed to `colorspace_fragment` */
  encodings_fragment: { deprecated: 154 },
  /** Renamed to `colorspace_pars_fragment` */
  encodings_pars_fragment: { deprecated: 154 },
  envmap_common_pars_fragment: {},
  envmap_fragment: {},
  envmap_pars_fragment: {},
  envmap_pars_vertex: {},
  envmap_physical_pars_fragment: {},
  envmap_vertex: {},
  fog_fragment: {},
  fog_pars_fragment: {},
  fog_pars_vertex: {},
  fog_vertex: {},
  gradientmap_pars_fragment: {},
  iridescence_fragment: { since: 141 },
  iridescence_pars_fragment: { since: 141 },
  /** Merged with `lights_fragment_maps` */
  lightmap_fragment: { deprecated: 164 },
  lightmap_pars_fragment: {},
  lightprobes_pars_fragment: { since: 184 },
  lights_fragment_begin: {},
  lights_fragment_end: {},
  lights_fragment_maps: {},
  lights_lambert_fragment: { since: 144 },
  lights_lambert_pars_fragment: { since: 144 },
  /** Renamed to `lights_lambert_fragment` */
  lights_lambert_vertex: { deprecated: 144 },
  lights_pars_begin: {},
  lights_phong_fragment: {},
  lights_phong_pars_fragment: {},
  lights_physical_fragment: {},
  lights_physical_pars_fragment: {},
  lights_toon_fragment: {},
  lights_toon_pars_fragment: {},
  logdepthbuf_fragment: {},
  logdepthbuf_pars_fragment: {},
  logdepthbuf_pars_vertex: {},
  logdepthbuf_vertex: {},
  map_fragment: {},
  map_pars_fragment: {},
  map_particle_fragment: {},
  map_particle_pars_fragment: {},
  metalnessmap_fragment: {},
  metalnessmap_pars_fragment: {},
  morphcolor_vertex: { since: 138 },
  morphinstance_vertex: { since: 162 },
  morphnormal_vertex: {},
  morphtarget_pars_vertex: {},
  morphtarget_vertex: {},
  normal_fragment_begin: {},
  normal_fragment_maps: {},
  normal_pars_fragment: {},
  normal_pars_vertex: {},
  normal_vertex: {},
  normalmap_pars_fragment: {},
  opaque_fragment: { since: 154 },
  /** Renamed to `opaque_fragment` */
  output_fragment: { deprecated: 154 },
  packing: {},
  premultiplied_alpha_fragment: {},
  project_vertex: {},
  roughnessmap_fragment: {},
  roughnessmap_pars_fragment: {},
  shadowmap_pars_fragment: {},
  shadowmap_pars_vertex: {},
  shadowmap_vertex: {},
  shadowmask_pars_fragment: {},
  skinbase_vertex: {},
  skinning_pars_vertex: {},
  skinning_vertex: {},
  skinnormal_vertex: {},
  specularmap_fragment: {},
  specularmap_pars_fragment: {},
  tonemapping_fragment: {},
  tonemapping_pars_fragment: {},
  transmission_fragment: {},
  transmission_pars_fragment: {},
  uv_pars_fragment: {},
  uv_pars_vertex: {},
  uv_vertex: {},
  /** Merged with `uv_pars_fragment` */
  uv2_pars_fragment: { deprecated: 151 },
  /** Merged with `uv_pars_vertex` */
  uv2_pars_vertex: { deprecated: 151 },
  /** Merged with `uv_vertex` */
  uv2_vertex: { deprecated: 151 },
  worldpos_vertex: {},
} satisfies Record<string, Metadata>);

export type IncludeName = keyof typeof includes;

/**
 * Filters `array` by includes which are available in the current revision
 * @param array Array of includes
 * @returns Filtered array of includes
 */
function getIncludes<T extends IncludeName>(array: T[]) {
  return array.filter((include) => includes[include].status === 'available');
}

const uvs = ['uv_pars_fragment', 'uv_pars_vertex', 'uv_vertex'] as const;
const uvs2 = ['uv2_pars_fragment', 'uv2_pars_vertex', 'uv2_vertex'] as const;

/**
 * Each key (feature) corresponds to an array of includes which the feature
 * absolutely requires to render.
 */
export const features = {
  /** `Material.alphaHash` (Alpha hashed transparency) */
  alphahash: getIncludes([
    'alphahash_fragment',
    'alphahash_pars_fragment',
    'common',
  ]),
  /** `Material.alphaMap` */
  alphamap: [...uvs, 'alphamap_fragment', 'alphamap_pars_fragment'],
  /** `Material.alphaTest` */
  alphatest: ['alphatest_fragment', 'alphatest_pars_fragment'],
  /** `Material.aoMap` (Ambient occlusion map) */
  aomap: [
    ...(revision < 151 ? uvs2 : uvs),
    'aomap_fragment',
    'aomap_pars_fragment',
    'common',
  ],
  /** `BatchedMesh` */
  batching: getIncludes(['batching_pars_vertex', 'batching_vertex']),
  /** `Material.bumpMap` */
  bumpmap: [...uvs, 'bumpmap_pars_fragment', 'normal_fragment_maps'],
  /** `Material.clippingPlanes` (or `WebGLRenderer.clippingPlanes`) */
  clipping: [
    'clipping_planes_fragment',
    'clipping_planes_pars_fragment',
    'clipping_planes_pars_vertex',
    'clipping_planes_vertex',
  ],
  /** `Material.vertexColors` */
  colors: [
    'color_fragment',
    'color_pars_fragment',
    'color_pars_vertex',
    'color_vertex',
  ],
  /**
   * These colorspace shaders are required by every material, *except* for
   * `RawShaderMaterial` (but even then you still probably want to use it!)
   */
  colorspace: getIncludes([
    'colorspace_fragment',
    'colorspace_pars_fragment',
    'encodings_fragment',
    'encodings_pars_fragment',
  ]),
  /** `Material.displacementMap` */
  displacementmap: [
    ...uvs,
    'beginnormal_vertex',
    'displacementmap_pars_vertex',
    'displacementmap_vertex',
  ],
  /** `Material.dithering` */
  dithering: ['common', 'dithering_fragment', 'dithering_pars_fragment'],
  /** `Material.emissiveMap` */
  emissivemap: [...uvs, 'emissivemap_fragment', 'emissivemap_pars_fragment'],
  /** `Material.envMap` (or `Scene.environment`) */
  envmap: [
    'beginnormal_vertex',
    'common',
    'defaultnormal_vertex',
    'envmap_common_pars_fragment',
    'worldpos_vertex',
  ],
  /** `Scene.fog` */
  fog: ['fog_fragment', 'fog_pars_fragment', 'fog_pars_vertex', 'fog_vertex'],
  /** `Material.iridescence` */
  iridescence: getIncludes([
    'common',
    'iridescence_fragment',
    'iridescence_pars_fragment',
  ]),
  /** `Material.lightMap` */
  lightmap: getIncludes([
    ...(revision < 151 ? uvs2 : uvs),
    'lightmap_fragment',
    'lightmap_pars_fragment',
    'lights_fragment_maps',
  ]),
  /** For any shader which responds to lights */
  lights: ['lights_fragment_begin', 'lights_fragment_end', 'lights_pars_begin'],
  /** `Renderer.logarithmicDepthBuffer` */
  logdepthbuf: [
    'common',
    'logdepthbuf_fragment',
    'logdepthbuf_pars_vertex',
    'logdepthbuf_pars_fragment',
    'logdepthbuf_vertex',
  ],
  /** `Material.map` (Diffuse map) */
  map: [...uvs, 'map_fragment', 'map_pars_fragment'],
  /** `Material.metalnessMap` */
  metalnessmap: [...uvs, 'metalnessmap_fragment', 'metalnessmap_pars_fragment'],
  /** `BufferGeometry.morphAttributes` (Morph targets) */
  morphtargets: getIncludes([
    'morphcolor_vertex',
    'morphinstance_vertex',
    'morphnormal_vertex',
    'morphtarget_pars_vertex',
    'morphtarget_vertex',
  ]),
  /** `Material.normalMap` */
  normalmap: [...uvs, 'normal_fragment_maps', 'normalmap_pars_fragment'],
  /** For any shader which uses the `normal` geometry attribute */
  normals: [
    'beginnormal_vertex',
    'defaultnormal_vertex',
    'normal_pars_fragment',
    'normal_pars_vertex',
    'normal_fragment_begin',
    'normal_vertex',
  ],
  /** `Material.roughnessMap` */
  roughnessmap: [...uvs, 'roughnessmap_fragment', 'roughnessmap_pars_fragment'],
  /** `Renderer.shadowMap.enabled` */
  shadows: [
    'beginnormal_vertex',
    'common',
    'defaultnormal_vertex',
    'shadowmap_pars_vertex',
    'shadowmap_pars_fragment',
    'shadowmap_vertex',
    'worldpos_vertex',
  ],
  /** `SkinnedMesh` */
  skinning: [
    'beginnormal_vertex',
    'skinning_pars_vertex',
    'skinbase_vertex',
    'skinning_vertex',
    'skinnormal_vertex',
  ],
  /** `Material.specularMap` */
  specularmap: [...uvs, 'specularmap_fragment', 'specularmap_pars_fragment'],
  /** `Renderer.toneMapping` */
  tonemapping: ['tonemapping_fragment', 'tonemapping_pars_fragment'],
  /** `Material.transmission` */
  transmission: [
    'common',
    'transmission_fragment',
    'transmission_pars_fragment',
    'worldpos_vertex',
  ],
  /** For any shader which uses the `position` geometry attribute */
  vertices: ['begin_vertex', 'project_vertex'],
} satisfies Record<string, IncludeName[]>;

export type FeatureName = keyof typeof features;

const coreOpaque = getIncludes(['output_fragment', 'opaque_fragment']);

/** `ShaderLib` key for `cube` material was renamed in Three.js r146 */
export const cubeMaterial = revision < 146 ? 'cube' : 'backgroundCube';

/** `ShaderLib` key for `distance` material was renamed in Three.js r182 */
export const distanceMaterial = revision < 182 ? 'distanceRGBA' : 'distance';

const distanceIncludes = [
  ...features.vertices,
  'common',
  'worldpos_vertex',
] as const;

/**
 * Conditional material include helper
 * @param condition Should the material include `value`?
 * @param value `IncludeName[]`
 * @returns `IncludeName[]` if `condition` is `true`, otherwise an empty array
 */
function includeIf<T extends readonly IncludeName[]>(
  condition: boolean,
  value: T,
): T | readonly [] {
  return condition ? value : [];
}

/**
 * Basically `THREE.ShaderLib` with only the necessary includes + some metadata
 *
 * Check {@link includes} for all includes.
 */
export const materials = computeStatus({
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `Texture` value
   * with a `mapping` property value of `UVMapping`
   */
  background: { includes: [] },
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `Texture` value
   * with a `mapping` property value that is *not* `UVMapping`
   */
  backgroundCube: {
    includes: [...features.vertices, 'common', 'cube_uv_reflection_fragment'],
    since: 146,
  },
  /**
   * Same as {@link materials.backgroundCube} (Maybe vestigial since r146)
   */
  cube: {
    includes: [
      ...features.vertices,
      ...includeIf(revision < 146, ['envmap_fragment']),
      'common',
    ],
  },
  /** `MeshDepthMaterial` */
  depth: {
    includes: [...features.vertices, 'packing'],
  },
  /** `MeshDistanceMaterial` */
  distance: { includes: distanceIncludes, since: 182 },
  /** `MeshDistanceMaterial` (renamed to `distance`) */
  distanceRGBA: { includes: distanceIncludes, deprecated: 182 },
  /** Apparently unused? Might be vestigial */
  equirect: {
    includes: [...features.vertices, 'common'],
  },
  /** `LineDashedMaterial` */
  dashed: {
    includes: [...coreOpaque, ...features.vertices],
  },
  /** `LineBasicMaterial` | `MeshBasicMaterial` */
  basic: {
    includes: [...coreOpaque, ...features.vertices, 'common'],
  },
  /** `MeshLambertMaterial` */
  lambert: {
    includes: [
      ...coreOpaque,
      ...features.lights,
      ...features.normals,
      ...features.vertices,
      ...includeIf(revision < 151, ['bsdfs']),
      ...includeIf(revision < 144, ['shadowmask_pars_fragment']),
      ...getIncludes([
        'lights_lambert_fragment',
        'lights_lambert_pars_fragment',
        'lights_lambert_vertex',
      ]),
      'common',
      'specularmap_fragment',
    ],
  },
  /** `MeshMatcapMaterial` */
  matcap: {
    includes: [...coreOpaque, ...features.normals, ...features.vertices],
  },
  /** `MeshNormalMaterial` */
  normal: {
    includes: [
      ...features.normals,
      ...features.vertices,
      ...includeIf(revision < 182, ['packing']),
    ],
  },
  /** `MeshPhongMaterial` */
  phong: {
    includes: [
      ...coreOpaque,
      ...features.lights,
      ...features.normals,
      ...features.vertices,
      'common',
      'bsdfs',
      'lights_phong_fragment',
      'lights_phong_pars_fragment',
      'specularmap_fragment',
    ],
  },
  /** `MeshStandardMaterial` */
  standard: {
    includes: [
      /* uses the same vert & frag shaders as `MeshPhysicalMaterial` */
    ],
  },
  /** `MeshPhysicalMaterial` (extends `MeshStandardMaterial`) */
  physical: {
    includes: [
      ...coreOpaque,
      ...features.lights,
      ...features.normals,
      ...features.vertices,
      ...includeIf(revision < 151, ['bsdfs']),
      'common',
      'lights_physical_fragment',
      'lights_physical_pars_fragment',
      'metalnessmap_fragment',
      'roughnessmap_fragment',
    ],
  },
  /** `MeshToonMaterial` */
  toon: {
    includes: [
      ...coreOpaque,
      ...features.lights,
      ...features.normals,
      ...features.vertices,
      ...includeIf(revision < 151, ['bsdfs']),
      'common',
      'gradientmap_pars_fragment',
      'lights_toon_fragment',
      'lights_toon_pars_fragment',
    ],
  },
  /** `PointsMaterial` */
  points: {
    includes: [...coreOpaque, ...features.vertices, 'common'],
  },
  /** `ShadowMaterial` */
  shadow: {
    includes: [
      ...features.shadows,
      ...features.vertices,
      ...includeIf(revision < 151, ['bsdfs']),
      'lights_pars_begin',
      'shadowmask_pars_fragment',
    ],
  },
  /** `SpriteMaterial` */
  sprite: {
    includes: [...coreOpaque, 'common'],
  },
} satisfies Record<
  string,
  Metadata & {
    /** Array of includes which the material absolutely requires to render */
    readonly includes: readonly IncludeName[];
  }
>);

export type MaterialName = keyof typeof materials;
