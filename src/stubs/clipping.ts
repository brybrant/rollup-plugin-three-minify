import { name } from '../../package.json';

import type { Options } from '../options';

const warning = JSON.stringify(`[${name}]:
Support for clipping planes has been removed.
If you wish to use clipping planes then you must include the "clipping" feature in the plugin options.`);

/**
 * @param debug Emit console warning?
 * @returns `WebGLClipping` stub
 */
export const WebGLClipping = (debug: Options['debug']) => `
function WebGLClipping() {
  return {
    numPlanes: 0,
    numIntersection: 0,
    uniform: {
      value: null,
      needsUpdate: false,
    },
    init: function (${debug ? ' planes, enableLocalClipping ' : ''}) {
      ${
        debug
          ? `
      if ( planes.length > 0 || enableLocalClipping ) {
        console.warn(${warning});
        this.init = function () { return false };
      }`
          : ''
      }
      return false;
    },
  };
}
`;
