import { revision } from './const';

const dummyWebGLTextures = `
function WebGLTextures(${revision < 182 ? '' : ' _gl, extensions, state '}) {
  this.allocateTextureUnit = function () { return 0 };
  this.resetTextureUnits =
    this.setTexture2D =
    this.setTexture2DArray =
    this.setTexture3D =
    this.setTextureCube =
    this.rebindTextures =
    this.setupRenderTarget =
    this.updateRenderTargetMipmap =
    this.updateMultisampleRenderTarget =
    this.setupDepthRenderbuffer =
    this.setupFrameBufferTexture =
    ${revision < 138 ? 'this.safeSetTexture2D = this.safeSetTextureCube =' : ''}
      function () {};

  ${
    revision < 138
      ? ''
      : 'this.useMultisampledRTT = function () { return false };'
  }

  ${
    revision < 182
      ? ''
      : `this.isReversedDepthBuffer = state.buffers.depth.getReversed;`
  }
}
`;

/**
 * Replaces `WebGLTextures` with a dummy.
 * @param code code
 * @returns `code` (modified)
 */
export default function (code: string): string {
  return code.replace(
    /^function WebGLTextures.+{[\s\S]+?^}/m,
    dummyWebGLTextures,
  );
}
