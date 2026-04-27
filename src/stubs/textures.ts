import { name } from '../../package.json';

import { revision } from '../const';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for textures has been removed.
If you wish to use textures then you must include at least one of the following features in the plugin options:
- "alphamap"
- "aomap"
- "bumpmap"
- "displacementmap"
- "emissivemap"
- "envmap"
- "gradientmap"
- "lightmap"
- "map"
- "metalnessmap"
- "normalmap"
- "roughnessmap"
- "specularmap"
- "transmission"`);

/**
 * @param debug Emit console warning?
 * @returns `WebGLTextures` stub
 */
export const WebGLTextures = (debug: Options['debug']) => `
function WebGLTextures(${revision < 182 ? '' : ' _gl, extensions, state '}) {
  let textureUnits = 0;

  this.allocateTextureUnit = function () { return textureUnits++ };
  this.resetTextureUnits = function () { textureUnits = 0 };
  ${
    revision < 184
      ? ''
      : `
  this.getTextureUnits = function () { return textureUnits };
  this.setTextureUnits = function( value ) { textureUnits = value };`
  }

  this.rebindTextures =
    this.setupDepthRenderbuffer =
    this.setupFrameBufferTexture =
    this.setupRenderTarget =
    this.updateMultisampleRenderTarget =
    this.updateRenderTargetMipmap =
      function () {};

  ${debug ? 'let warned = false;' : ''}

  ${revision < 138 ? 'this.safeSetTextureCube = this.safeSetTexture2D =' : ''}
    this.setTextureCube =
    this.setTexture2D =
    this.setTexture2DArray =
    this.setTexture3D =
      function () {${
        debug ? `if ( !warned ) console.warn(${warning}); warned = true` : ''
      }};

  ${
    revision < 138
      ? ''
      : 'this.useMultisampledRTT = function () { return false };'
  }

  ${
    revision < 182
      ? ''
      : 'this.isReversedDepthBuffer = state.buffers.depth.getReversed;'
  }
}
`;
