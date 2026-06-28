# rollup-plugin-three-minify

[<img src='https://img.shields.io/npm/v/rollup-plugin-three-minify'>](https://www.npmjs.com/package/rollup-plugin-three-minify)

This plugin reduces the bundle size of applications using [Three.js](https://threejs.org) by:
- Removing redundant `WebGLRenderer` subsystems
- Removing redundant materials from `ShaderLib`
- Removing redundant shaders from `ShaderChunk`
- Minifies GLSL code by removing redundant whitespace and mangling identifiers

> [!NOTE]
> This plugin is backwards-compatible with Three.js revisions down to 135. It might work with earlier revisions but I will not guarantee that.

## Rationale

- JavaScript minification tools like [terser](https://terser.org/) will not minify the contents of string literals such as GLSL code. This plugin however will minify the Three.js GLSL code used by your application, and remove any unused GLSL code.
- The `WebGLRenderer` class includes many optional subsystems which are never removed by tree-shaking. This plugin will determine the necessary subsystems based on your [options](#options) and replace any unused subsystems with no-op stubs.

> [!WARNING]
> By default, this plugin behaves as a **whitelist** and will remove **ALL** GLSL code and optional subsystems. You must specify exactly which [features](#features) and [materials](#materials) your application requires; everything else will be removed.

## Install

```console
npm install three rollup-plugin-three-minify
```

## Usage

Add this plugin to the start of your bundler plugins array:

<details>
<summary>Rollup / Rolldown</summary>

```js
// rollup.config.js / rolldown.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin(),
    // Other plugins...
  ],
};
```
</details>

<details>
<summary>Vite</summary>

```js
// vite.config.js
import { defineConfig } from 'vite';
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default defineConfig({
  plugins: [
    threeMinifyPlugin(),
    // Other plugins...
  ],
});
```
</details>

### Usage Example

Import `three` and build your application as you normally would:

```js
// index.js (entry file)
import * as THREE from 'three';

const scene = new THREE.Scene();

const mesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(),
  new THREE.MeshBasicMaterial(),
);

scene.add(mesh);

const camera = new THREE.PerspectiveCamera();

camera.position.setZ(-4);
camera.lookAt(mesh.position);

const renderer = new THREE.WebGLRenderer();
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);
```

This basic example only uses `MeshBasicMaterial` and no other features, so your plugin configuration should look like this:

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      materials: 'basic',
    }),
  ],
};
```

This Rollup configuration will remove all shaders and subsystems that are not required by `MeshBasicMaterial`. If you need to use other features like textures or shadows then you must specify that in the [options](#options) object!

## Options

### `include`

- **Type:** `string | string[]`
- **Default:** `['**/*.glsl']`

Glob pattern(s) matching GLSL files to transform (mangle and minify)

> [!NOTE]
> Each glob must be a valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern.
> Globs are resolved relative to the current working directory.

---
### `exclude`

- **Type:** `string | string[]`
- **Default:** `[]`

Glob pattern(s) matching GLSL files to ignore

> [!NOTE]
> Each glob must be a valid [picomatch](https://github.com/micromatch/picomatch#globbing-features) pattern.
> Globs are resolved relative to the current working directory.

---
### `mangle`

- **Type:** `boolean`
- **Default:** `true`

When enabled, mutable GLSL identifiers will be mangled to further minify GLSL code and improve compression.

Set this option to `false` to help debug shader errors.

> [!NOTE]
> Mangled identifiers will always match this regex: `_[a-zA-Z0-9]+`
> 
> If you keep this option enabled, please avoid using identifiers which start with an underscore (`_`) in your GLSL code to avoid naming conflicts.

<details>
<summary>Mangle Example</summary>

Only "mutable" identifiers from Three.js GLSL code will be mangled.

All "immutable" identifiers (such as uniforms) will remain unchanged.

```glsl
// vertex.glsl
varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  vec3 objectNormal = vec3( normal );
  vec3 transformedNormal = objectNormal;
  transformedNormal = normalMatrix * transformedNormal;
  vNormal = normalize( transformedNormal );

  vec3 transformed = vec3( position );
  vec4 mvPosition = vec4( transformed, 1.0 );
  mvPosition = modelViewMatrix * mvPosition;
  gl_Position = projectionMatrix * mvPosition;

  vViewPosition = - mvPosition.xyz;
}
```

```glsl
// fragment.glsl
uniform vec3 diffuse;
uniform float opacity;

varying vec3 vViewPosition;
varying vec3 vNormal;

void main() {
  vec4 diffuseColor = vec4( diffuse, opacity );

  float rimGlow = 1.0 - max( 0.0, dot( vNormal, normalize( vViewPosition ) ) );
  rimGlow = pow( rimGlow, 10.0 );
  diffuseColor.rgb += vec3( 1.0 ) * rimGlow;

  gl_FragColor = diffuseColor;
}
```

```js
// index.js
import { Color, ShaderMaterial } from 'three';

/* GLSL will be minified and mangled when you import it */
import vertexShader from 'vertex.glsl';
import fragmentShader from 'fragment.glsl';

/* Usage example */
const material = new ShaderMaterial({
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
});
// ...
```

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      mangle: true, /* true by default */
    }),
  ],
};
```
</details>

---
### `colorKeywords`

- **Type:** `boolean`
- **Default:** `false`

Three.js contains an object called `colorKeywords` which maps CSS color names (see [named-color](https://mdn.io/named-color)) to color values, so you can create colors with CSS color names.

Set this option to `true` if your application will create colors by name.

<details>
<summary>Color Keyword Example</summary>

```ts
// index.js
import { Color } from 'three';
const red: Color = new Color('red');
const hex: string = red.getHexString(); // "ff0000"
```

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      colorKeywords: true,
    }),
  ],
};
```
</details>

___
### `jsonMethods`

- **Type:** `boolean`
- **Default:** `false`

Many classes in Three.js include a `toJSON()` method which is used to safely serialize its data. Some classes also have a `fromJSON()` method which is used to reverse the serialization. These methods are analogous to [`JSON.stringify()`](http://mdn.io/stringify) and [`JSON.parse()`](http://mdn.io/parse).

Set this option to `true` if your application will use these JSON methods.

<details>
<summary>JSON Method Example</summary>

```ts
// index.js
import { Sphere } from 'three';
const data: string = JSON.stringify(new Sphere()); // calls `Sphere.toJSON()`
const test: Sphere = new Sphere().fromJSON(data);
```

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      jsonMethods: true,
    }),
  ],
};
```
</details>

___
### `xr`

- **Type:** `boolean`
- **Default:** `false`

The `WebGLRenderer` class includes a subsystem called `WebXRManager` which is responsible for managing XR stuff (like virtual reality).

Set this option to `true` if you are building an XR application.

<details>
<summary>WebXR Example</summary>

```ts
// index.js
import { WebGLRenderer } from 'three';
const renderer = new WebGLRenderer();
renderer.xr.enabled = true;
```

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      xr: true,
    }),
  ],
};
```
</details>

___
### `materials`

- **Type:** `MaterialName | MaterialName[]`
- **Default:** `[]`

Three.js material(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> Every material (except `RawShaderMaterial`) requires a specific set of [`chunks`](#chunks) to render, otherwise the renderer will crash.
> 
> This plugin will keep only the necessary `chunks` for each material in this option. Some optional material features will not work unless you specify them in the [`features`](#features) option.

<details>
<summary>MaterialName Type</summary>

|`MaterialName`|Usage|
|--|--|
|`background`|"Flat" textures on [`Scene.background`](https://threejs.org/docs/#Scene.background)|
|`backgroundCube`|Cube or Equirectangular textures on `Scene.background` (since revision ≥146)|
|`cube`|Same as `backgroundCube` (for revisions <146)|
|`depth`|[`MeshDepthMaterial`](https://threejs.org/docs/#MeshDepthMaterial)|
|`distance`|[`MeshDistanceMaterial`](https://threejs.org/docs/#MeshDistanceMaterial) (since revision ≥182)|
|`distanceRGBA`|Same as `distance` (for revisions <182)|
|`dashed`|[`LineDashedMaterial`](https://threejs.org/docs/#LineDashedMaterial)|
|`basic`|[`LineBasicMaterial`](https://threejs.org/docs/#LineBasicMaterial) or [`MeshBasicMaterial`](https://threejs.org/docs/#MeshBasicMaterial)|
|`lambert`|[`MeshLambertMaterial`](https://threejs.org/docs/#MeshLambertMaterial)|
|`matcap`|[`MeshMatcapMaterial`](https://threejs.org/docs/#MeshMatcapMaterial)|
|`normal`|[`MeshNormalMaterial`](https://threejs.org/docs/#MeshNormalMaterial)|
|`phong`|[`MeshPhongMaterial`](https://threejs.org/docs/#MeshPhongMaterial)|
|`standard`|[`MeshStandardMaterial`](https://threejs.org/docs/#MeshStandardMaterial)|
|`physical`|[`MeshPhysicalMaterial`](https://threejs.org/docs/#MeshPhysicalMaterial)|
|`toon`|[`MeshToonMaterial`](https://threejs.org/docs/#MeshToonMaterial)|
|`points`|[`PointsMaterial`](https://threejs.org/docs/#PointsMaterial)|
|`shadow`|[`ShadowMaterial`](https://threejs.org/docs/#ShadowMaterial)|
|`sprite`|[`SpriteMaterial`](https://threejs.org/docs/#SpriteMaterial)|
</details>

___
### `features`

- **Type:** `FeatureName | FeatureName[]`
- **Default:** `[]`

Three.js feature(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> Each "feature" refers to a group of interdependent [`chunks`](#chunks) and is thus a safer way to define the requirements of your application.

<details>
<summary>FeatureName Type</summary>

Check [this handy Material Feature compatibility table](https://threejs.org/manual/#en/material-table)

|`FeatureName`|Usage|
|--|--|
|`alphahash`|[`Material.alphaHash`](https://threejs.org/docs/#Material.alphaHash) (since revision ≥154)|
|`alphamap`|`Material.alphaMap`|
|`alphatest`|[`Material.alphaTest`](https://threejs.org/docs/#Material.alphaTest)|
|`aomap`|`Material.aoMap`|
|`batching`|[`BatchedMesh`](https://threejs.org/docs/#BatchedMesh) (since revision ≥159)|
|`bumpmap`|`Material.bumpMap`|
|`clipping`|[`Material.clippingPlanes`](https://threejs.org/docs/#Material.clippingPlanes) (or [`WebGLRenderer.clippingPlanes`](https://threejs.org/docs/#WebGLRenderer.clippingPlanes))|
|`colors`|[`Material.vertexColors`](https://threejs.org/docs/#Material.vertexColors)|
|`colorspace`|*Automatically included by all materials (except `RawShaderMaterial`)*|
|`displacementmap`|`Material.displacementMap`|
|`dithering`|[`Material.dithering`](https://threejs.org/docs/#Material.dithering)|
|`emissivemap`|`Material.emissiveMap`|
|`envmap`|`Material.envMap` (or [`Scene.environment`](https://threejs.org/docs/#Scene.environment))|
|`fog`|[`Scene.fog`](https://threejs.org/docs/#Scene.fog)|
|`iridescence`|[`Material.iridescence`](https://threejs.org/docs/#MeshPhysicalMaterial.iridescence) (since revision ≥141)|
|`lightmap`|`Material.lightMap`|
|`lights`|For any shader which responds to lights<sup>[[1]](#feature-caveat1)</sup>|
|`logdepthbuf`|[`Renderer.logarithmicDepthBuffer`](https://threejs.org/docs/#Renderer.logarithmicDepthBuffer)|
|`map`|`Material.map`|
|`metalnessmap`|[`Material.metalnessMap`](https://threejs.org/docs/#MeshStandardMaterial.metalnessMap)|
|`morphtargets`|[`BufferGeometry.morphAttributes`](https://threejs.org/docs/#BufferGeometry.morphAttributes)|
|`normalmap`|`Material.normalMap`|
|`normals`|For any shader which uses the `normal` geometry attribute<sup>[[1]](#feature-caveat1)</sup>|
|`roughnessmap`|[`Material.roughnessMap`](https://threejs.org/docs/#MeshStandardMaterial.roughnessMap)|
|`shadows`|[`Renderer.shadowMap.enabled`](https://threejs.org/docs/#Renderer.shadowMap)|
|`skinning`|[`SkinnedMesh`](https://threejs.org/docs/#SkinnedMesh)|
|`specularmap`|`Material.specularMap`|
|`tonemapping`|[`Renderer.toneMapping`](https://threejs.org/docs/#Renderer.toneMapping)|
|`transmission`|[`Material.transmission`](https://threejs.org/docs/#MeshPhysicalMaterial.transmission)|
|`vertices`|For any shader which uses the `position` geometry attribute<sup>[[1]](#feature-caveat1)</sup>|

<a name="feature-caveat1"></a>
<sup>[1]</sup> *This feature is automatically included by applicable Three.js materials, so exists only as convenience for authoring custom shaders.*
</details>

___
### `chunks`

- **Type:** `ChunkName | ChunkName[]`
- **Default:** `[]`

Three.js shader chunk(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> The word "chunks" refers to entries of `ShaderChunk`, which are pieces of GLSL code injected into shaders at runtime via `#include <xyz>` directives by `WebGLProgram`.
> 
> Most `chunks` require other "sibling" `chunks` to function properly, therefore it is recommended to use the [`features`](#features) option instead for convenience, but you can also use this option for more precise control.

<details>
<summary>ChunkName Type</summary>

Please check your ShaderChunk source code for a full list of all "chunks" relevant to your revision of Three.js:
```
.../node_modules/three/src/renderers/shaders/ShaderChunk
```
</details>

___
### `textures`

- **Type:** `boolean`
- **Default:** `false`

The `WebGLRenderer` class uses a subsystem called `WebGLTextures` which is responsible for managing textures.

Set this option to `true` if your application uses textures in ways that cannot be inferred by your selection of [`materials`](#materials) or [`features`](#features) (for example, if your application uses render targets or custom shaders).

---
### `debug`

- **Type:** `boolean`
- **Default:** `false`

Useful in development *(should be disabled in production)*

When enabled, pruned subsystems will emit a warning if used and explain how to change the plugin configuration to include the subsystem.

<details>
<summary>Debug Example</summary>

```js
// index.js
import { WebGLRenderer } from 'three';
const renderer = new WebGLRenderer();

/**
 * Clipping planes will not work because the "clipping" feature is omitted.
 * Debug mode is enabled, so the `WebGLClipping` stub will emit a warning.
 */
renderer.localClippingEnabled = true;
```

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({
      debug: true,
    }),
  ],
};
```
</details>
