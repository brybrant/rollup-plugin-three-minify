import {
  Mesh,
  PerspectiveCamera,
  Scene,
  DirectionalLight,
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three';

const scene = new Scene();

const geometry = new TorusKnotGeometry(5, 2, 128, 16, 4, 6);

/** Older revisions of THREE require `uv2` attribute for lightMap and aoMap */
if (window._Revision < 151) geometry.attributes.uv2 = geometry.attributes.uv;

const camera = new PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  10,
  40,
);

camera.position.set(0, 0, -20);

camera.lookAt(0, 0, 0);

const light = new DirectionalLight(0xffffff, 1);
light.castShadow = true;

light.position.set(0, 10, -15);

light.shadow.camera.position.copy(light.position);
light.shadow.camera.lookAt(0, 0, 0);
light.shadow.camera.top = light.shadow.camera.right = 10;
light.shadow.camera.bottom = light.shadow.camera.left = -10;
light.shadow.camera.near = 5;
light.shadow.camera.far = 40;
light.shadow.camera.updateProjectionMatrix();

scene.add(light);

const renderer = new WebGLRenderer();

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
 * @param {SceneCallback} [props.callback]
 * @param {string} props.label
 * @param {import('three').Material} props.material
 */
export function createScene(props) {
  const mesh = new Mesh(geometry, props.material);

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  if (props.callback) props.callback(scene, renderer);

  label.innerText = props.label;

  requestAnimationFrame(() => {
    renderer.setSize(
      document.body.offsetWidth,
      document.body.offsetHeight,
      false,
    );
    renderer.render(scene, camera);
  });
}
