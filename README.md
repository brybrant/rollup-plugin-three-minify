# rollup-plugin-three-minify

This plugin reduces the bundle size of applications which import Three.js as an internal dependency by:
- Removing redundant `WebGLRenderer` subsystems
- Removing redundant materials from `ShaderLib`
- Removing redundant shaders from `ShaderChunk`
- Rudimentary minification of GLSL code by removing redundant whitespace

This plugin is backwards-compatible with THREE revisions down to 135. It might work with earlier revisions but I don't care to test that.

> [!TIP]
> This Rollup plugin is also compatible with [Rolldown](https://rolldown.rs/) and [Vite](https://vite.dev/).

## Why?

JavaScript minification tools like [terser](https://terser.org/) will not minify the contents of string literals such as GLSL code. This plugin however will minify the Three.js GLSL code used by your application, and remove any unused GLSL code.

The `WebGLRenderer` class includes many subsystems which are not removed by tree-shaking. This plugin will determine the necessary subsystems based on your options, and remove any subsystems not required by your application.

> [!NOTE]
> By default, this plugin will remove **ALL** GLSL code and optional subsystems. You must specify exactly which features and materials your application requires in the [options](#options) object.

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
    {
      ...threeMinifyPlugin(),
      // Only minify Three.js on `build` phase!
      apply: 'build',
    },
    // Other plugins...
  ],
});
```
</details>

### Example

Import `three` and build your application as you normally would:

```js
// index.js (entry file)
import * as THREE from 'three';

const scene = new THREE.Scene();

const mesh = new THREE.Mesh(
  new THREE.TorusKnotGeometry(5, 2, 128, 16, 4, 6),
  new THREE.MeshBasicMaterial(),
);

scene.add(mesh);

const camera = new THREE.PerspectiveCamera();

camera.position.set(0, 0, -20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer();
renderer.render(scene, camera);

document.body.appendChild(renderer.domElement);
```

This basic example only uses `MeshBasicMaterial` and no other features, so your plugin configuration would look like this:

```js
// rollup.config.js
import threeMinifyPlugin from 'rollup-plugin-three-minify';

export default {
  input: 'index.js',
  plugins: [
    threeMinifyPlugin({ materials: 'basic' }),
  ],
};
```

This Rollup configuration will remove all shaders and subsystems that are not required by `MeshBasicMaterial`. If you need to use other materials or features like textures or shadows then you must explicitly enable them in the [options](#options) object, otherwise it will not work!

## Options

### `colorKeywords`

- **Type:** `boolean`
- **Default:** `false`

<details>
<summary>Description</summary>

Three.js contains an object called `colorKeywords` which maps CSS color names (see [named-color](https://mdn.io/named-color)) to color values, so you can create colors with CSS color names.

> [!NOTE]
> Set this option to `true` if your application will instantiate colors by name.

#### Color Keyword Example
```ts
import { Color } from 'three';
const red: Color = new Color('red');
const hex: string = red.getHexString(); // "ff0000"
```
</details>

### `jsonMethods`

- **Type:** `boolean`
- **Default:** `false`

<details>
<summary>Description</summary>

Many classes in Three.js include a `toJSON()` method which is automatically called when [`JSON.stringify()`](https://mdn.io/stringify) is used on an instance of that class, and is used to serialize its data. Some classes also have a `fromJSON()` method which is used to reverse the serialization (similar to the [`JSON.parse()`](http://mdn.io/parse) method).

> [!NOTE]
> Set this option to `true` if your application will use these JSON methods.

#### JSON Example
```ts
import { Sphere } from 'three';
const data: string = JSON.stringify(new Sphere()); // calls `Sphere.toJSON()`
const test: Sphere = new Sphere().fromJSON(data);
```
</details>

### `xr`

- **Type:** `boolean`
- **Default:** `false`

<details>
<summary>Description</summary>

The `WebGLRenderer` class includes a subsystem called `WebXRManager` which is responsible for managing XR stuff (like virtual reality).

> [!NOTE]
> Set this option to `true` if you are building an XR application.
</details>

### `materials`

- **Type:** `MaterialName | MaterialName[]`
- **Default:** `[]`

<details>
<summary>Description</summary>

This option contains the material(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> Every material (except `RawShaderMaterial`) requires a specific set of [`includes`](#includes) to render, otherwise the renderer will crash.
>
> This plugin will keep only the necessary `includes` for each material in this option. Some material features will fail unless you specify them in the [`features`](#features) option.

Type `MaterialName`:
- `background` (for "flat" textures on `Scene.background`)
- `backgroundCube` (for cube or equirectangular textures on `Scene.background`, since revision >=146)
- `cube` (same as `backgroundCube` for revisions <146)
- `depth` (for `MeshDepthMaterial`)
- `distance` (for `MeshDistanceMaterial`, since revision >=182)
- `distanceRGBA` (same as `distance` for revisions <182)
- `dashed` (for `LineDashedMaterial`)
- `basic` (for `LineBasicMaterial` or `MeshBasicMaterial`)
- `lambert` (for `MeshLambertMaterial`)
- `matcap` (for `MeshMatcapMaterial`)
- `normal` (for `MeshNormalMaterial`)
- `phong` (for `MeshPhongMaterial`)
- `standard` (for `MeshStandardMaterial`)
- `physical` (for `MeshPhysicalMaterial`)
- `toon` (for `MeshToonMaterial`)
- `points` (for `PointsMaterial`)
- `shadow` (for `ShadowMaterial`)
- `sprite` (for `SpriteMaterial`)
</details>

### `features`

- **Type:** `FeatureName | FeatureName[]`
- **Default:** `[]`

<details>
<summary>Description</summary>

This option contains the feature(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> Each "feature" refers to a group of interdependent [`includes`](#includes) and is thus a safer way to define the requirements of your application.

Type `FeatureName`:
- `alphahash` (Alpha hashed transparency, since revision >=154)
- `alphamap`
- `alphatest`
- `aomap` (Ambient Occlusion map)
- `batching` (for `BatchedMesh`, since revision >=159)
- `bumpmap`
- `clipping` (Clipping planes)
- `colors` (Vertex colors)
- `colorspace` (Automatically included by all materials except `RawShaderMaterial`)
- `displacementmap`
- `dithering`
- `emissivemap`
- `envmap` (Environment map)
- `fog`
- `gradientmap` (for `MeshToonMaterial`) MIGHT BE REDUNDANT - CHECK OLD REVS
- `iridescence` (for `MeshPhysicalMaterial` only, since revision >=141)
- `lightmap`
- `logdepthbuf` (Logarithmic depth buffer)
- `map` (Diffuse map)
- `metalnessmap` (for `MeshStandardMaterial`)
- `morphtargets`
- `normalmap`
- `roughnessmap` (for `MeshStandardMaterial`)
- `shadows` (If `WebGLRenderer.shadowMap.enabled` is set to `true`)
- `skinning`
- `specularmap`
- `tonemapping`
- `transmission` (for `MeshPhysicalMaterial` only)

Check [this handy compatibility table](https://threejs.org/manual/#en/material-table)
</details>

### `includes`

- **Type:** `IncludeName | IncludeName[]`
- **Default:** `[]`

<details>
<summary>Description</summary>

This option contains the include(s) to keep in the bundle **(whitelist)**

> [!NOTE]
> I use the word "include" to mean keys of `ShaderChunk`, because they correlate to pieces of GLSL code which are injected via `#include <xyz>` directives at runtime by `WebGLProgram`.
> 
> Most `includes` require other "sibling" `includes` to function properly, therefore it is recommended to use the [`features`](#features) option instead for convenience, but you can use this option for more precise control.

Type `IncludeName`:
(Please check Three.js ShaderChunk source code for a full list of all "includes")
</details>

### `textures`

- **Type:** `boolean`
- **Default:** `false`

<details>
<summary>Description</summary>

The `WebGLRenderer` class uses a subsystem called `WebGLTextures` which is responsible for managing textures.

> [!NOTE]
> While the necessity of all other subsystems can simply be derived from your selection of [materials](#materials) and [features](#features), this is not always possible for the `WebGLTextures` subsystem; therefore this option exists in case you need to explicity include the subsystem (for example, if your application uses render targets)
</details>

### `debug`

- **Type:** `boolean`
- **Default:** `false`

<details>
<summary>Description</summary>

Useful in development (should be disabled in production)

When enabled, pruned subsystems will emit a warnning if used and explain how to change the plugin configuration to include the subsystem.
</details>
