import type { Options } from './options';

/**
 * `String.replace()` callback function
 * @param match The matched string (`$&`)
 * @param groups Capture groups
 * @returns Transformed string
 */
export type Replacer = (match: string, ...groups: string[]) => string;

type ChunkArray = ReadonlyArray<ChunkName>;

type Metadata = {
  /** `THREE.REVISION` of addition (assumes available since the beginning) */
  readonly since?: number;
  /** `THREE.REVISION` of removal (assumes never deprecated) */
  readonly deprecated?: number;
  /** Array of subsystems required by this chunk/feature/material */
  readonly subsystems?: ReadonlyArray<keyof Options['subsystems']>;
  /** Array of chunks required by this feature/material */
  readonly chunks?: ChunkArray | ((revision: number) => ChunkArray);
};

export type RuntimeMetadata = Omit<Metadata, 'chunks'> & {
  readonly chunks?: ChunkArray;
  /**
   * - `future` = `revision < since`
   * - `available` = `revision >= since && revision < deprecated`
   * - `deprecated` = `revision >= deprecated`
   */
  readonly status: 'future' | 'available' | 'deprecated';
};

const metadata = {
  alphahash: { since: 154 },
  batching: { since: 159, subsystems: ['textures'] },
  iridescence: { since: 141 },
} satisfies Record<string, Metadata>;

/**
 * Basically `THREE.ShaderChunk` with some metadata (minus material shaders)
 *
 * These "chunks" are injected into material shaders via `#include <shader>`
 * GLSL directives.
 *
 * Check {@link materialsMetadata} for material shaders.
 */
const chunksMetadata = {
  alphahash_fragment: metadata.alphahash,
  alphahash_pars_fragment: metadata.alphahash,
  alphamap_fragment: { subsystems: ['textures'] },
  alphamap_pars_fragment: { subsystems: ['textures'] },
  alphatest_fragment: {},
  alphatest_pars_fragment: {},
  aomap_fragment: { subsystems: ['textures'] },
  aomap_pars_fragment: { subsystems: ['textures'] },
  batching_pars_vertex: metadata.batching,
  batching_vertex: metadata.batching,
  begin_vertex: {},
  beginnormal_vertex: {},
  bsdfs: {},
  bumpmap_pars_fragment: { subsystems: ['textures'] },
  clearcoat_normal_fragment_begin: {},
  clearcoat_normal_fragment_maps: { subsystems: ['textures'] },
  clearcoat_pars_fragment: {},
  clipping_planes_fragment: { subsystems: ['clipping'] },
  clipping_planes_pars_fragment: { subsystems: ['clipping'] },
  clipping_planes_pars_vertex: { subsystems: ['clipping'] },
  clipping_planes_vertex: { subsystems: ['clipping'] },
  color_fragment: {},
  color_pars_fragment: {},
  color_pars_vertex: {},
  color_vertex: {},
  colorspace_fragment: { since: 154 },
  colorspace_pars_fragment: { since: 154 },
  common: {},
  cube_uv_reflection_fragment: { subsystems: ['environments'] },
  defaultnormal_vertex: {},
  displacementmap_pars_vertex: { subsystems: ['textures'] },
  displacementmap_vertex: { subsystems: ['textures'] },
  dithering_fragment: {},
  dithering_pars_fragment: {},
  emissivemap_fragment: { subsystems: ['textures'] },
  emissivemap_pars_fragment: { subsystems: ['textures'] },
  /** Renamed to `colorspace_fragment` */
  encodings_fragment: { deprecated: 154 },
  /** Renamed to `colorspace_pars_fragment` */
  encodings_pars_fragment: { deprecated: 154 },
  envmap_common_pars_fragment: { subsystems: ['environments'] },
  envmap_fragment: { subsystems: ['environments'] },
  envmap_pars_fragment: { subsystems: ['environments'] },
  envmap_pars_vertex: { subsystems: ['environments'] },
  envmap_physical_pars_fragment: { subsystems: ['environments'] },
  envmap_vertex: { subsystems: ['environments'] },
  fog_fragment: {},
  fog_pars_fragment: {},
  fog_pars_vertex: {},
  fog_vertex: {},
  gradientmap_pars_fragment: { subsystems: ['textures'] },
  iridescence_fragment: metadata.iridescence,
  iridescence_pars_fragment: metadata.iridescence,
  /** Merged with `lights_fragment_maps` */
  lightmap_fragment: { deprecated: 164, subsystems: ['lights', 'textures'] },
  lightmap_pars_fragment: { subsystems: ['lights', 'textures'] },
  lightprobes_pars_fragment: { since: 184, subsystems: ['lights'] },
  lights_fragment_begin: { subsystems: ['lights'] },
  lights_fragment_end: { subsystems: ['lights'] },
  lights_fragment_maps: { subsystems: ['lights', 'textures'] },
  lights_lambert_fragment: { since: 144, subsystems: ['lights'] },
  lights_lambert_pars_fragment: { since: 144, subsystems: ['lights'] },
  /** Renamed to `lights_lambert_fragment` */
  lights_lambert_vertex: { deprecated: 144, subsystems: ['lights'] },
  lights_pars_begin: { subsystems: ['lights'] },
  lights_phong_fragment: { subsystems: ['lights'] },
  lights_phong_pars_fragment: { subsystems: ['lights'] },
  lights_physical_fragment: { subsystems: ['lights'] },
  lights_physical_pars_fragment: { subsystems: ['lights'] },
  lights_toon_fragment: { subsystems: ['lights'] },
  lights_toon_pars_fragment: { subsystems: ['lights'] },
  logdepthbuf_fragment: {},
  logdepthbuf_pars_fragment: {},
  logdepthbuf_pars_vertex: {},
  logdepthbuf_vertex: {},
  map_fragment: { subsystems: ['textures'] },
  map_pars_fragment: { subsystems: ['textures'] },
  map_particle_fragment: { subsystems: ['textures'] },
  map_particle_pars_fragment: { subsystems: ['textures'] },
  metalnessmap_fragment: {},
  metalnessmap_pars_fragment: { subsystems: ['textures'] },
  morphcolor_vertex: { since: 138, subsystems: ['morphtargets'] },
  morphinstance_vertex: { since: 162, subsystems: ['morphtargets'] },
  morphnormal_vertex: { subsystems: ['morphtargets'] },
  morphtarget_pars_vertex: { subsystems: ['morphtargets'] },
  morphtarget_vertex: { subsystems: ['morphtargets'] },
  normal_fragment_begin: {},
  normal_fragment_maps: { subsystems: ['textures'] },
  normal_pars_fragment: {},
  normal_pars_vertex: {},
  normal_vertex: {},
  normalmap_pars_fragment: { subsystems: ['textures'] },
  opaque_fragment: { since: 154 },
  /** Renamed to `opaque_fragment` */
  output_fragment: { deprecated: 154 },
  packing: {},
  premultiplied_alpha_fragment: {},
  project_vertex: {},
  roughnessmap_fragment: {},
  roughnessmap_pars_fragment: { subsystems: ['textures'] },
  shadowmap_pars_fragment: { subsystems: ['shadowmap'] },
  shadowmap_pars_vertex: { subsystems: ['shadowmap'] },
  shadowmap_vertex: { subsystems: ['shadowmap'] },
  shadowmask_pars_fragment: { subsystems: ['shadowmap'] },
  skinbase_vertex: {},
  skinning_pars_vertex: {},
  skinning_vertex: {},
  skinnormal_vertex: {},
  specularmap_fragment: {},
  specularmap_pars_fragment: { subsystems: ['textures'] },
  tonemapping_fragment: {},
  tonemapping_pars_fragment: {},
  transmission_fragment: { subsystems: ['textures'] },
  transmission_pars_fragment: { subsystems: ['textures'] },
  uv_pars_fragment: { subsystems: ['textures'] },
  uv_pars_vertex: { subsystems: ['textures'] },
  uv_vertex: { subsystems: ['textures'] },
  /** Merged with `uv_pars_fragment` */
  uv2_pars_fragment: { deprecated: 151, subsystems: ['textures'] },
  /** Merged with `uv_pars_vertex` */
  uv2_pars_vertex: { deprecated: 151, subsystems: ['textures'] },
  /** Merged with `uv_vertex` */
  uv2_vertex: { deprecated: 151, subsystems: ['textures'] },
  worldpos_vertex: {},
} satisfies Record<string, Metadata>;

export type ChunkName = keyof typeof chunksMetadata;

const uvs = ['uv_pars_fragment', 'uv_pars_vertex', 'uv_vertex'] as const;
const uvs2 = ['uv2_pars_fragment', 'uv2_pars_vertex', 'uv2_vertex'] as const;

/**
 * Each key (feature) corresponds to an array of chunks which the feature
 * absolutely requires to render.
 */
const featuresMetadata = {
  /** `Material.alphaHash` (Alpha hashed transparency) */
  alphahash: {
    ...metadata.alphahash,
    chunks: ['alphahash_fragment', 'alphahash_pars_fragment', 'common'],
  },
  /** `Material.alphaMap` */
  alphamap: {
    chunks: [...uvs, 'alphamap_fragment', 'alphamap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `Material.alphaTest` */
  alphatest: {
    chunks: ['alphatest_fragment', 'alphatest_pars_fragment'],
  },
  /** `Material.aoMap` (Ambient occlusion map) */
  aomap: {
    chunks: (revision) => [
      ...(revision < 151 ? uvs2 : uvs),
      'aomap_fragment',
      'aomap_pars_fragment',
      'common',
    ],
    subsystems: ['textures'],
  },
  /** `BatchedMesh` */
  batching: {
    ...metadata.batching,
    chunks: ['batching_pars_vertex', 'batching_vertex'],
  },
  /** `Material.bumpMap` */
  bumpmap: {
    chunks: [...uvs, 'bumpmap_pars_fragment', 'normal_fragment_maps'],
    subsystems: ['textures'],
  },
  /** `Material.clippingPlanes` (or `WebGLRenderer.clippingPlanes`) */
  clipping: {
    chunks: [
      'clipping_planes_fragment',
      'clipping_planes_pars_fragment',
      'clipping_planes_pars_vertex',
      'clipping_planes_vertex',
    ],
    subsystems: ['clipping'],
  },
  /** `Material.vertexColors` */
  colors: {
    chunks: [
      'color_fragment',
      'color_pars_fragment',
      'color_pars_vertex',
      'color_vertex',
    ],
  },
  /**
   * These colorspace shaders are required by every material, *except* for
   * `RawShaderMaterial` (but even then you still probably want to use it!)
   */
  colorspace: {
    chunks: [
      'colorspace_fragment',
      'colorspace_pars_fragment',
      'encodings_fragment',
      'encodings_pars_fragment',
    ],
  },
  /** `Material.displacementMap` */
  displacementmap: {
    chunks: [
      ...uvs,
      'beginnormal_vertex',
      'displacementmap_pars_vertex',
      'displacementmap_vertex',
    ],
    subsystems: ['textures'],
  },
  /** `Material.dithering` */
  dithering: {
    chunks: ['common', 'dithering_fragment', 'dithering_pars_fragment'],
  },
  /** `Material.emissiveMap` */
  emissivemap: {
    chunks: [...uvs, 'emissivemap_fragment', 'emissivemap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `Material.envMap` (or `Scene.environment`) */
  envmap: {
    chunks: [
      'beginnormal_vertex',
      'common',
      'defaultnormal_vertex',
      'envmap_common_pars_fragment',
      'worldpos_vertex',
    ],
    subsystems: ['environments'],
  },
  /** `Scene.fog` */
  fog: {
    chunks: [
      'fog_fragment',
      'fog_pars_fragment',
      'fog_pars_vertex',
      'fog_vertex',
    ],
  },
  /** `Material.iridescence` */
  iridescence: {
    ...metadata.iridescence,
    chunks: ['common', 'iridescence_fragment', 'iridescence_pars_fragment'],
  },
  /** `Material.lightMap` */
  lightmap: {
    chunks: (revision) => [
      ...(revision < 151 ? uvs2 : uvs),
      'lightmap_fragment',
      'lightmap_pars_fragment',
      'lights_fragment_maps',
    ],
    subsystems: ['lights', 'textures'],
  },
  /** For any shader which responds to lights */
  lights: {
    chunks: [
      'common',
      'lights_fragment_begin',
      'lights_fragment_end',
      'lights_pars_begin',
    ],
    subsystems: ['lights'],
  },
  /** `Renderer.logarithmicDepthBuffer` */
  logdepthbuf: {
    chunks: [
      'common',
      'logdepthbuf_fragment',
      'logdepthbuf_pars_vertex',
      'logdepthbuf_pars_fragment',
      'logdepthbuf_vertex',
    ],
  },
  /** `Material.map` (Diffuse map) */
  map: {
    chunks: [...uvs, 'map_fragment', 'map_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `Material.metalnessMap` */
  metalnessmap: {
    chunks: [...uvs, 'metalnessmap_fragment', 'metalnessmap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `BufferGeometry.morphAttributes` (Morph targets) */
  morphtargets: {
    chunks: [
      'morphcolor_vertex',
      'morphinstance_vertex',
      'morphnormal_vertex',
      'morphtarget_pars_vertex',
      'morphtarget_vertex',
    ],
    subsystems: ['morphtargets'],
  },
  /** `Material.normalMap` */
  normalmap: {
    chunks: [...uvs, 'normal_fragment_maps', 'normalmap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** For any shader which uses the `normal` geometry attribute */
  normals: {
    chunks: [
      'beginnormal_vertex',
      'defaultnormal_vertex',
      'normal_fragment_begin',
      'normal_pars_fragment',
      'normal_pars_vertex',
      'normal_vertex',
    ],
  },
  /** `Material.roughnessMap` */
  roughnessmap: {
    chunks: [...uvs, 'roughnessmap_fragment', 'roughnessmap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `Renderer.shadowMap.enabled` */
  shadows: {
    chunks: [
      'beginnormal_vertex',
      'common',
      'defaultnormal_vertex',
      'shadowmap_pars_vertex',
      'shadowmap_pars_fragment',
      'shadowmap_vertex',
      'worldpos_vertex',
    ],
    subsystems: ['shadowmap'],
  },
  /** `SkinnedMesh` */
  skinning: {
    chunks: [
      'beginnormal_vertex',
      'skinning_pars_vertex',
      'skinbase_vertex',
      'skinning_vertex',
      'skinnormal_vertex',
    ],
  },
  /** `Material.specularMap` */
  specularmap: {
    chunks: [...uvs, 'specularmap_fragment', 'specularmap_pars_fragment'],
    subsystems: ['textures'],
  },
  /** `Renderer.toneMapping` */
  tonemapping: {
    chunks: ['tonemapping_fragment', 'tonemapping_pars_fragment'],
  },
  /** `Material.transmission` */
  transmission: {
    chunks: [
      'common',
      'transmission_fragment',
      'transmission_pars_fragment',
      'worldpos_vertex',
    ],
    subsystems: ['textures'],
  },
  /** For any shader which uses the `position` geometry attribute */
  vertices: {
    chunks: ['common', 'begin_vertex', 'project_vertex'],
  },
} satisfies Record<string, Metadata>;

export type FeatureName = keyof typeof featuresMetadata;

/**
 * Conditional material chunk helper
 * @param condition Should the material include `value`?
 * @param value `ChunkName[]`
 * @returns `ChunkName[]` if `condition` is `true`, otherwise an empty array
 */
function includeIf<T extends readonly ChunkName[]>(
  condition: boolean,
  value: T,
): T | readonly [] {
  return condition ? value : [];
}

const coreOpaque = ['output_fragment', 'opaque_fragment'] as const;

const distanceChunks = [
  ...featuresMetadata.vertices.chunks,
  'worldpos_vertex',
] as const;

/**
 * Basically `THREE.ShaderLib` with only the necessary chunks + some metadata
 *
 * Check {@link chunksMetadata} for all chunks.
 */
const materialsMetadata = {
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `Texture` value
   * with a `mapping` property value of `UVMapping`
   */
  background: { chunks: [], subsystems: ['background'] },
  /**
   * Used in `WebGLBackground` when `Scene.background` is a `Texture` value
   * with a `mapping` property value that is *not* `UVMapping`
   */
  backgroundCube: {
    chunks: [
      ...featuresMetadata.vertices.chunks,
      'cube_uv_reflection_fragment',
    ],
    since: 146,
    subsystems: ['background'],
  },
  /** Same as {@link materialsMetadata.backgroundCube} (Maybe vestigial since r146) */
  cube: {
    chunks: (revision) => [
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 146, ['envmap_fragment']),
    ],
    subsystems: ['background'],
  },
  /** `MeshDepthMaterial` */
  depth: {
    chunks: [...featuresMetadata.vertices.chunks, 'packing'],
  },
  /** `MeshDistanceMaterial` */
  distance: { chunks: distanceChunks, since: 182 },
  /** `MeshDistanceMaterial` (renamed to `distance`) */
  distanceRGBA: { chunks: distanceChunks, deprecated: 182 },
  /** Apparently unused? Might be vestigial */
  equirect: {
    chunks: [...featuresMetadata.vertices.chunks],
  },
  /** `LineDashedMaterial` */
  dashed: {
    chunks: [...coreOpaque, ...featuresMetadata.vertices.chunks],
  },
  /** `LineBasicMaterial` | `MeshBasicMaterial` */
  basic: {
    chunks: [...coreOpaque, ...featuresMetadata.vertices.chunks],
  },
  /** `MeshLambertMaterial` */
  lambert: {
    chunks: (revision) => [
      ...coreOpaque,
      ...featuresMetadata.lights.chunks,
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 151, ['bsdfs']),
      ...includeIf(revision < 144, ['shadowmask_pars_fragment']),
      'lights_lambert_fragment',
      'lights_lambert_pars_fragment',
      'lights_lambert_vertex',
      'specularmap_fragment',
    ],
    subsystems: ['lights'],
  },
  /** `MeshMatcapMaterial` */
  matcap: {
    chunks: [
      ...coreOpaque,
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
    ],
    subsystems: ['textures'],
  },
  /** `MeshNormalMaterial` */
  normal: {
    chunks: (revision) => [
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 182, ['packing']),
    ],
  },
  /** `MeshPhongMaterial` */
  phong: {
    chunks: [
      ...coreOpaque,
      ...featuresMetadata.lights.chunks,
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
      'bsdfs',
      'lights_phong_fragment',
      'lights_phong_pars_fragment',
      'specularmap_fragment',
    ],
    subsystems: ['lights'],
  },
  /** `MeshStandardMaterial` */
  standard: {
    chunks: (revision) => [
      ...coreOpaque,
      ...featuresMetadata.lights.chunks,
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 151, ['bsdfs']),
      'lights_physical_fragment',
      'lights_physical_pars_fragment',
      'metalnessmap_fragment',
      'roughnessmap_fragment',
    ],
    subsystems: ['lights'],
  },
  /** `MeshPhysicalMaterial` (extends `MeshStandardMaterial`) */
  physical: {
    chunks: [
      /* uses the same vert & frag shaders as `MeshStandardMaterial` */
    ],
  },
  /** `MeshToonMaterial` */
  toon: {
    chunks: (revision) => [
      ...coreOpaque,
      ...featuresMetadata.lights.chunks,
      ...featuresMetadata.normals.chunks,
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 151, ['bsdfs']),
      'gradientmap_pars_fragment',
      'lights_toon_fragment',
      'lights_toon_pars_fragment',
    ],
    subsystems: ['lights', 'textures'],
  },
  /** `PointsMaterial` */
  points: {
    chunks: [...coreOpaque, ...featuresMetadata.vertices.chunks],
  },
  /** `ShadowMaterial` */
  shadow: {
    chunks: (revision) => [
      ...featuresMetadata.shadows.chunks,
      ...featuresMetadata.vertices.chunks,
      ...includeIf(revision < 151, ['bsdfs']),
      'lights_pars_begin',
      'shadowmask_pars_fragment',
    ],
    subsystems: ['lights', 'textures'],
  },
  /** `SpriteMaterial` */
  sprite: {
    chunks: [...coreOpaque, 'common'],
  },
} satisfies Record<string, Metadata>;

export type MaterialName = keyof typeof materialsMetadata;

/**
 * Compute appropriate metadata for chunks, features, and materials.
 * @param revision `Number(THREE.REVISION)`
 * @returns chunks, features, and materials relevant to `revision`
 */
export function computeMetadata(revision: number) {
  /**
   * Derives the value of `status` for each object entry at runtime
   * @param record Object with values of `Metadata`
   * @returns Object with `status` property added to each value
   */
  function computeStatus<T extends Record<string, Metadata>>(record: T) {
    const result = {} as { [K in keyof T]: RuntimeMetadata };

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

      result[key] = {
        ...(metadata.since !== undefined && {
          since: metadata.since,
        }),
        ...(metadata.deprecated !== undefined && {
          deprecated: metadata.deprecated,
        }),
        ...(metadata.subsystems !== undefined && {
          subsystems: metadata.subsystems,
        }),
        ...(metadata.chunks !== undefined && {
          chunks:
            typeof metadata.chunks === 'function'
              ? metadata.chunks(revision)
              : metadata.chunks,
        }),
        status,
      };
    }

    return result;
  }

  const chunks = computeStatus(chunksMetadata);

  const features = computeStatus(featuresMetadata);

  const materials = computeStatus(materialsMetadata);

  return {
    chunks,
    features,
    materials,
    /** `ShaderLib` key for `cube` material was renamed in Three.js r146 */
    cubeMaterial: revision < 146 ? 'cube' : 'backgroundCube',
    /** `ShaderLib` key for `distance` material was renamed in Three.js r182 */
    distanceMaterial: revision < 182 ? 'distanceRGBA' : 'distance',
    /** `Number(THREE.REVISION)` */
    revision,
  } as const;
}

export type ThreeMetadata = ReturnType<typeof computeMetadata>;
