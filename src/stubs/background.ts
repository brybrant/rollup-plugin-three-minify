import { name } from '../../package.json';

import type { ThreeMetadata } from '../const';
import type { Options } from '../options';

/**
 * @param debug Emit console warning?
 * @param metadata Three.js metadata
 * @returns `WebGLBackground` stub
 */
export const WebGLBackground = (
  debug: Options['debug'],
  metadata: ThreeMetadata,
) => {
  const { cubeMaterial, revision } = metadata;

  const warning = JSON.stringify(`[${name}]:
Support for textures on Scene.background property has been removed.
If you wish to use background textures then you must include the appropriate background material in the plugin options:
- "background" for flat textures
- "${cubeMaterial}" for cube textures`);

  return `
function WebGLBackground(
  renderer,
  ${revision < 183 ? 'cubemaps' : 'environments'},
  ${revision > 145 && revision < 183 ? 'cubeuvmaps,' : ''}
  state,
  objects,
  alpha,
  premultipliedAlpha,
) {
  const clearColor = new Color(0);
  let clearAlpha = alpha === true ? 0 : 1;

  function setClear( color, alpha ) {
    ${
      revision < 147
        ? ''
        : 'color.getRGB( _rgb, getUnlitUniformColorSpace( renderer ) );'
    }

    state.buffers.color.setClear(${
      revision < 147 ? 'color.r, color.g, color.b' : '_rgb.r, _rgb.g, _rgb.b'
    }, alpha, premultipliedAlpha );
  }

  ${debug ? 'let warned = false;' : ''}

  return {
    getClearColor: function () {
      return clearColor;
    },
    setClearColor: function ( color, alpha = 1 ) {
      clearColor.set( color );
      clearAlpha = alpha;
      setClear( clearColor, clearAlpha );
    },
    getClearAlpha: function () {
      return clearAlpha;
    },
    setClearAlpha: function ( alpha ) {
      clearAlpha = alpha;
      setClear( clearColor, clearAlpha );
    },
    render: function ( ${revision < 164 ? 'renderList, ' : ''}scene ) {
      let forceClear = false;
      let background = scene.isScene === true ? scene.background : null;

      if ( background && background.isTexture ) {
        ${
          debug
            ? `if ( !warned ) { console.warn(${warning}); warned = true }`
            : ''
        }
        background = null;
      }

      if ( background === null ) {
        setClear( clearColor, clearAlpha );
      } else if ( background && background.isColor ) {
        setClear( background, 1 );
        forceClear = true;
      }

      if ( renderer.autoClear || forceClear ) {
        ${
          revision < 165
            ? ''
            : `
        state.buffers.depth.setTest( true );
        state.buffers.depth.setMask( true );
        state.buffers.color.setMask( true );`
        }

        renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
      }
    },
    addToRenderList: function () {},
    dispose: function () {},
  };
}
`;
};
