import { revision } from './const';

const dummyWebGLBackground = `
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

  return {
    getClearColor: function() {
      return clearColor;
    },
    setClearColor: function( color, alpha = 1 ) {
      clearColor.set( color );
      clearAlpha = alpha;
      setClear( clearColor, clearAlpha );
    },
    getClearAlpha: function() {
      return clearAlpha;
    },
    setClearAlpha: function( alpha ) {
      clearAlpha = alpha;
      setClear( clearColor, clearAlpha );
    },
    render: function() {
      setClear( clearColor, clearAlpha );

      if ( renderer.autoClear ) {
        // buffers might not be writable which is required to ensure a correct clear

        state.buffers.depth.setTest( true );
        state.buffers.depth.setMask( true );
        state.buffers.color.setMask( true );

        renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
      }
    },
    addToRenderList: function() {},
    dispose: function() {},
  };
}
`;

/**
 * Replaces `WebGLBackground` with a dummy.
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(
    /^function WebGLBackground.+{[\s\S]+?^}/m,
    dummyWebGLBackground,
  );
}
