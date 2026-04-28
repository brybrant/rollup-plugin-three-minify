import {
  Mesh,
  PerspectiveCamera,
  Scene,
  DirectionalLight,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three';

export const scene = new Scene();

export const geometry = new TorusKnotGeometry();

/** Older revisions require `uv2` attribute for lightMap and aoMap */
if (window._Revision < 151) geometry.attributes.uv2 = geometry.attributes.uv;

const camera = new PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  6,
);

camera.position.setZ(-4);

camera.lookAt(0, 0, 0);

export const light = new DirectionalLight(0xffffff, 1);

light.position.set(0, 2, -3);

export const renderer = new WebGLRenderer();

const label = document.createElement('span');
label.className = 'label';

document.body.appendChild(renderer.domElement);
document.body.appendChild(label);

/**
 * @callback SceneCallback
 * @param {Scene} scene
 * @param {WebGLRenderer} renderer
 * @returns {void}
 */

/**
 * @param {object} props
 * @param {string} props.label
 * @param {import('three').Material} props.material
 */
export function createScene(props) {
  const mesh = new Mesh(geometry, props.material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  label.innerText = props.label;

  requestAnimationFrame(() => {
    renderer.setSize(
      document.body.offsetWidth,
      document.body.offsetHeight,
      false,
    );
    renderer.render(scene, camera);

    requestAnimationFrame(() => renderer.render(scene, camera));
  });
}
