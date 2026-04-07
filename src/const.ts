// @ts-expect-error No declaration (`REVISION` is a number in a string)
import { REVISION } from 'three';

/**
 * This refers to the current (semver) "MINOR" version of THREE installed.
 * For example, if `0.150.1` is installed, then `revision` will be `150`.
 *
 * This plugin is backwards-compatible with THREE revisions down to 135.
 * It might work with earlier revisions but I don't care to test that.
 */
export const revision = Number(REVISION);

/**
 * This list contains `keyof typeof THREE.ShaderChunk` (minus material shaders)
 *
 * These shaders are meant to be imported into material shaders via
 * `#include <shader>` GLSL directives.
 *
 * Check {@link materials} for material shaders.
 */
export const includes = <const>[
  'alphahash_fragment',
  'alphahash_pars_fragment',
  'alphamap_fragment',
  'alphamap_pars_fragment',
  'alphatest_fragment',
  'alphatest_pars_fragment',
  'aomap_fragment',
  'aomap_pars_fragment',
  'batching_pars_vertex',
  'batching_vertex',
  'begin_vertex',
  'beginnormal_vertex',
  'bsdfs',
  'bumpmap_pars_fragment',
  'clearcoat_normal_fragment_begin',
  'clearcoat_normal_fragment_maps',
  'clearcoat_pars_fragment',
  'clipping_planes_fragment',
  'clipping_planes_pars_fragment',
  'clipping_planes_pars_vertex',
  'clipping_planes_vertex',
  'color_fragment',
  'color_pars_fragment',
  'color_pars_vertex',
  'color_vertex',
  'colorspace_fragment',
  'colorspace_pars_fragment',
  'common',
  'cube_uv_reflection_fragment',
  'defaultnormal_vertex',
  'displacementmap_pars_vertex',
  'displacementmap_vertex',
  'dithering_fragment',
  'dithering_pars_fragment',
  'emissivemap_fragment',
  'emissivemap_pars_fragment',
  'encodings_fragment', // Renamed to `colorspace_fragment` in r154
  'encodings_pars_fragment', // Renamed to `colorspace_pars_fragment` in r154
  'envmap_common_pars_fragment',
  'envmap_fragment',
  'envmap_pars_fragment',
  'envmap_pars_vertex',
  'envmap_physical_pars_fragment',
  'envmap_vertex',
  'fog_fragment',
  'fog_pars_fragment',
  'fog_pars_vertex',
  'fog_vertex',
  'gradientmap_pars_fragment',
  'iridescence_fragment', // Added in r141
  'iridescence_pars_fragment', // Added in r141
  'lightmap_fragment', // Merged with `lights_fragment_maps` in r164
  'lightmap_pars_fragment',
  'lights_fragment_begin',
  'lights_fragment_end',
  'lights_fragment_maps',
  'lights_lambert_fragment',
  'lights_lambert_pars_fragment', // Added in r144
  'lights_lambert_vertex', // Renamed to `lights_lambert_fragment` in r144
  'lights_pars_begin',
  'lights_phong_fragment',
  'lights_phong_pars_fragment',
  'lights_physical_fragment',
  'lights_physical_pars_fragment',
  'lights_toon_fragment',
  'lights_toon_pars_fragment',
  'logdepthbuf_fragment',
  'logdepthbuf_pars_fragment',
  'logdepthbuf_pars_vertex',
  'logdepthbuf_vertex',
  'map_fragment',
  'map_pars_fragment',
  'map_particle_fragment',
  'map_particle_pars_fragment',
  'metalnessmap_fragment',
  'metalnessmap_pars_fragment',
  'morphcolor_vertex', // Added in r138
  'morphinstance_vertex', // Added in r162
  'morphnormal_vertex',
  'morphtarget_pars_vertex',
  'morphtarget_vertex',
  'normal_fragment_begin',
  'normal_fragment_maps',
  'normal_pars_fragment',
  'normal_pars_vertex',
  'normal_vertex',
  'normalmap_pars_fragment',
  'opaque_fragment',
  'output_fragment', // Renamed to `opaque_fragment` in r154
  'packing',
  'premultiplied_alpha_fragment',
  'project_vertex',
  'roughnessmap_fragment',
  'roughnessmap_pars_fragment',
  'shadowmap_pars_fragment',
  'shadowmap_pars_vertex',
  'shadowmap_vertex',
  'shadowmask_pars_fragment',
  'skinbase_vertex',
  'skinning_pars_vertex',
  'skinning_vertex',
  'skinnormal_vertex',
  'specularmap_fragment',
  'specularmap_pars_fragment',
  'tonemapping_fragment',
  'tonemapping_pars_fragment',
  'transmission_fragment',
  'transmission_pars_fragment',
  'uv_pars_fragment',
  'uv_pars_vertex',
  'uv_vertex',
  'uv2_pars_fragment', // Merged with `uv_pars_fragment` in r151
  'uv2_pars_vertex', // Merged with `uv_pars_vertex` in r151
  'uv2_vertex', // Merged with `uv_vertex` in r151
  'worldpos_vertex',
];

export type IncludeName = (typeof includes)[number];

const uvs = (<const>[
  'uv_pars_fragment',
  'uv_pars_vertex',
  'uv_vertex',
]) satisfies IncludeName[];

const uvs2 = (<const>[
  'uv2_pars_fragment',
  'uv2_pars_vertex',
  'uv2_vertex',
]) satisfies IncludeName[];

const colorspace = revision < 154 ? 'encodings' : 'colorspace';

/**
 * Each key (feature) corresponds to an array of type `IncludeName` which the
 * feature absolutely requires to render.
 */
export const features = (<const>{
  /** Alpha hashed transparency */
  alphahash: ['alphahash_fragment', 'alphahash_pars_fragment', 'common'],
  /** Alpha map */
  alphamap: [...uvs, 'alphamap_fragment', 'alphamap_pars_fragment'],
  /** Alpha test (If your app will use a material with `alphaTest` > 0) */
  alphatest: ['alphatest_fragment', 'alphatest_pars_fragment'],
  /** Ambient occlusion map */
  aomap: [
    ...(revision < 151 ? uvs2 : uvs),
    'aomap_fragment',
    'aomap_pars_fragment',
    'common',
  ],
  batching: ['batching_pars_vertex', 'batching_vertex'],
  bumpmap: [...uvs, 'bumpmap_pars_fragment', 'normal_fragment_maps'],
  /** Clipping planes */
  clipping: [
    'clipping_planes_fragment',
    'clipping_planes_pars_fragment',
    'clipping_planes_pars_vertex',
    'clipping_planes_vertex',
  ],
  /** Vertex colors */
  colors: [
    'color_fragment',
    'color_pars_fragment',
    'color_pars_vertex',
    'color_vertex',
  ],
  /**
   * These colorspace shaders are always required, unless your app *only* uses
   * `RawShaderMaterial` (but even then you still probably want to use it!)
   */
  colorspace: [`${colorspace}_fragment`, `${colorspace}_pars_fragment`],
  displacementmap: [
    ...uvs,
    'beginnormal_vertex',
    'displacementmap_pars_vertex',
    'displacementmap_vertex',
  ],
  dithering: ['common', 'dithering_fragment', 'dithering_pars_fragment'],
  emissivemap: [...uvs, 'emissivemap_fragment', 'emissivemap_pars_fragment'],
  envmap: [
    'beginnormal_vertex',
    'common',
    'defaultnormal_vertex',
    'envmap_common_pars_fragment',
    'worldpos_vertex',
  ],
  fog: ['fog_fragment', 'fog_pars_fragment', 'fog_pars_vertex', 'fog_vertex'],
  gradientmap: [...uvs, 'gradientmap_pars_fragment'],
  iridescence: ['common', 'iridescence_fragment', 'iridescence_pars_fragment'],
  lightmap: [
    ...(revision < 151 ? uvs2 : uvs),
    ...((revision < 164 ? ['lightmap_fragment'] : []) satisfies IncludeName[]),
    'lightmap_pars_fragment',
    'lights_fragment_maps',
  ],
  /** Logarithmic depth buffer */
  logdepthbuf: [
    'common',
    'logdepthbuf_fragment',
    'logdepthbuf_pars_vertex',
    'logdepthbuf_pars_fragment',
    'logdepthbuf_vertex',
  ],
  /** Diffuse map */
  map: [...uvs, 'map_fragment', 'map_pars_fragment'],
  metalnessmap: [...uvs, 'metalnessmap_fragment', 'metalnessmap_pars_fragment'],
  normalmap: [...uvs, 'normal_fragment_maps', 'normalmap_pars_fragment'],
  roughnessmap: [...uvs, 'roughnessmap_fragment', 'roughnessmap_pars_fragment'],
  shadows: [
    'beginnormal_vertex',
    'common',
    'defaultnormal_vertex',
    'shadowmap_pars_vertex',
    'shadowmap_pars_fragment',
    'shadowmap_vertex',
    'worldpos_vertex',
  ],
  skinning: [
    'beginnormal_vertex',
    'skinning_pars_vertex',
    'skinbase_vertex',
    'skinning_vertex',
    'skinnormal_vertex',
  ],
  specularmap: [...uvs, 'specularmap_fragment', 'specularmap_pars_fragment'],
  tonemapping: ['tonemapping_fragment', 'tonemapping_pars_fragment'],
  transmission: [
    'common',
    'transmission_pars_fragment',
    'transmission_fragment',
    'worldpos_vertex',
  ],
}) satisfies Record<string, IncludeName[]>;

export type FeatureName = keyof typeof features;

const coreVertex = (<const>[
  'begin_vertex',
  'project_vertex',
]) satisfies IncludeName[];

/** Not necessarily required (if all materials have flat shading) */
const coreNormal = (<const>[
  'beginnormal_vertex',
  'defaultnormal_vertex',
  'normal_pars_fragment',
  'normal_pars_vertex',
  'normal_fragment_begin',
  'normal_vertex',
]) satisfies IncludeName[];

const coreLights = (<const>[
  'lights_fragment_begin',
  'lights_fragment_end',
  'lights_pars_begin',
]) satisfies IncludeName[];

const coreOpaque = [
  revision < 154 ? 'output_fragment' : 'opaque_fragment',
] satisfies IncludeName[];

/** `ShaderLib` key for `distance` material was renamed in THREE r182 */
export const distanceMaterial = revision < 182 ? 'distanceRGBA' : 'distance';

const distanceIncludes = [
  ...coreVertex,
  'common',
  'worldpos_vertex',
] satisfies IncludeName[];

/**
 * This list contains `keyof typeof THREE.ShaderLib`
 *
 * Each key (material) corresponds to an array of type `IncludeName` which the
 * material absolutely requires to render.
 *
 * Check {@link includes} for all includes.
 */
export const materials = {
  /** Used in `WebGLBackground` when `Scene.background` is a (flat) `Texture` */
  background: [],
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `CubeTexture`.
   * (Added in r146)
   */
  backgroundCube: [...coreVertex, 'common', 'cube_uv_reflection_fragment'],
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `CubeTexture`.
   * (Might be vestigial since r146)
   */
  cube: [
    ...coreVertex,
    ...((revision < 146 ? ['envmap_fragment'] : []) satisfies IncludeName[]),
    'common',
  ],
  /** `MeshDepthMaterial` */
  depth: [...coreVertex, 'packing'],
  /** `MeshDistanceMaterial` */
  distance: distanceIncludes,
  /** `MeshDistanceMaterial` (renamed to `distance` in r182) */
  distanceRGBA: distanceIncludes,
  /** Apparently unused? Might be vestigial */
  equirect: [...coreVertex, 'common'],
  /** `LineDashedMaterial` */
  dashed: [...coreOpaque, ...coreVertex],
  /** `LineBasicMaterial` | `MeshBasicMaterial` */
  basic: [...coreOpaque, ...coreVertex, 'common'],
  /** `MeshLambertMaterial` */
  lambert: [
    ...coreLights,
    ...coreNormal,
    ...coreOpaque,
    ...coreVertex,
    ...((revision < 151 ? ['bsdfs'] : []) satisfies IncludeName[]),
    ...((revision < 144
      ? ['shadowmask_pars_fragment']
      : []) satisfies IncludeName[]),
    ...((revision < 144
      ? ['lights_lambert_vertex']
      : [
          'lights_lambert_fragment',
          'lights_lambert_pars_fragment',
        ]) satisfies IncludeName[]),
    'common',
    'specularmap_fragment',
  ],
  /** `MeshMatcapMaterial` */
  matcap: [...coreOpaque, ...coreNormal, ...coreVertex],
  /** `MeshNormalMaterial` */
  normal: [
    ...coreNormal,
    ...coreVertex,
    ...((revision < 182 ? ['packing'] : []) satisfies IncludeName[]),
  ],
  /** `MeshPhongMaterial` */
  phong: [
    ...coreLights,
    ...coreNormal,
    ...coreOpaque,
    ...coreVertex,
    'common',
    'bsdfs',
    'lights_phong_fragment',
    'lights_phong_pars_fragment',
    'specularmap_fragment',
  ],
  /** `MeshStandardMaterial` */
  standard: [
    /* uses the same vert & frag shaders as `MeshPhysicalMaterial` */
  ],
  /** `MeshPhysicalMaterial` (extends `MeshStandardMaterial`) */
  physical: [
    ...coreLights,
    ...coreNormal,
    ...coreOpaque,
    ...coreVertex,
    ...((revision < 151 ? ['bsdfs'] : []) satisfies IncludeName[]),
    'common',
    'lights_physical_fragment',
    'lights_physical_pars_fragment',
    'metalnessmap_fragment',
    'roughnessmap_fragment',
  ],
  /** `MeshToonMaterial` */
  toon: [
    ...coreLights,
    ...coreNormal,
    ...coreOpaque,
    ...coreVertex,
    ...((revision < 151 ? ['bsdfs'] : []) satisfies IncludeName[]),
    'common',
    'gradientmap_pars_fragment',
    'lights_toon_fragment',
    'lights_toon_pars_fragment',
  ],
  /** `PointsMaterial` */
  points: [...coreOpaque, ...coreVertex, 'common'],
  /** `ShadowMaterial` */
  shadow: [
    ...coreVertex,
    ...features.shadows,
    ...((revision < 151 ? ['bsdfs'] : []) satisfies IncludeName[]),
    'lights_pars_begin',
    'shadowmask_pars_fragment',
  ],
  /** `SpriteMaterial` */
  sprite: [...coreOpaque, 'common'],
} satisfies Record<string, IncludeName[]>;

export type MaterialName = keyof typeof materials;
